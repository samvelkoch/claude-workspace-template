"""Business Review build flow: catalog of curated questions + BR assembly."""

from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.config import settings
from app.llm.client import get_llm_client
from app.sessions import store as session_store
from app.sm_db.queries import execute_select
from app.sm_db.render import render_sm_query

router = APIRouter()

_CATALOG: dict[str, Any] | None = None


def _catalog_path() -> Path:
    return Path("data/sm_question_catalog.json")


def _load_catalog() -> dict[str, Any]:
    global _CATALOG
    if _CATALOG is None:
        p = _catalog_path()
        if not p.exists():
            raise FileNotFoundError(f"Question catalog not found: {p}")
        _CATALOG = json.loads(p.read_text(encoding="utf-8"))
    return _CATALOG


@router.get("/catalog/questions")
async def get_catalog() -> dict[str, Any]:
    return _load_catalog()


# ── Build BR ────────────────────────────────────────────────────────────────

class BRPeriod(BaseModel):
    start: str
    end: str
    label: str


class BRInterview(BaseModel):
    audience: str = ""
    focus: list[str] = Field(default_factory=list)
    detail_level: str = ""
    comparison: str = ""
    segmentation: list[str] = Field(default_factory=list)
    must_include: str = ""
    must_skip: str = ""


class BuildBRRequest(BaseModel):
    question_ids: list[str]
    period: BRPeriod
    interview: BRInterview = Field(default_factory=BRInterview)


def _resolve_questions(ids: list[str]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Возвращает (resolved, categories) в порядке списка ids."""
    catalog = _load_catalog()
    by_id = {q["id"]: q for q in catalog["questions"]}
    resolved: list[dict[str, Any]] = []
    for qid in ids:
        q = by_id.get(qid)
        if q is not None:
            resolved.append(q)
    return resolved, catalog["categories"]


def _format_sql(sql: str, period: BRPeriod) -> str:
    return sql.replace("{start}", period.start).replace("{end}", period.end)


_NUM_RE = re.compile(r"-?\d+(?:[.,]\d+)?")


def _df_highlights(df, max_lines: int = 5) -> str:
    """Короткое текстовое summary датафрейма: первые строки в виде compact text."""
    if df is None:
        return "_нет данных_"
    try:
        if df.empty:
            return "_0 строк_"
        head = df.head(max_lines)
        cols = list(head.columns)
        lines: list[str] = []
        for _, row in head.iterrows():
            parts = []
            for c in cols:
                v = row[c]
                if v is None:
                    sv = "—"
                else:
                    try:
                        sv = f"{float(v):,.0f}".replace(",", " ") if isinstance(v, (int, float)) else str(v)
                    except Exception:
                        sv = str(v)
                parts.append(f"{c}={sv}")
            lines.append("; ".join(parts))
        return " | ".join(lines)
    except Exception:
        return "_не удалось извлечь highlights_"


async def _exec_summary_llm(
    period_label: str,
    interview: BRInterview,
    blocks_meta: list[dict[str, Any]],
) -> str:
    """Просит LLM написать executive summary на основе списка вопросов и highlights."""
    bullets = []
    for b in blocks_meta[:30]:
        bullets.append(f"- [{b['category_title']}] {b['title']}: {b['highlights']}")
    audience = interview.audience or "руководство"
    focus = ", ".join(interview.focus) if interview.focus else "общие итоги"
    must_inc = interview.must_include.strip()
    must_skip = interview.must_skip.strip()

    user_prompt = (
        f"Ты пишешь Executive Summary для Business Review за период {period_label}.\n"
        f"Аудитория: {audience}. Главные акценты: {focus}.\n"
        f"Уровень детализации: {interview.detail_level or 'стандарт'}.\n"
        f"База сравнения: {interview.comparison or 'не задана'}.\n"
        + (f"Обязательно упомянуть: {must_inc}\n" if must_inc else "")
        + (f"Не показывать: {must_skip}\n" if must_skip else "")
        + "\nДанные по запросам (ниже их основные показатели):\n"
        + "\n".join(bullets)
        + "\n\nНапиши Executive Summary: 3-4 коротких параграфа на русском языке. "
        "Без воды, конкретные цифры если есть, тон — деловой, для CFO/COO. "
        "Не используй заголовки и списки — только связный текст. "
        "Не выдумывай цифры, опирайся только на приведённые данные. "
        "Если данных мало — честно скажи об этом."
    )

    client = get_llm_client()
    try:
        # stream=True — рабочий контракт этого LLM endpoint
        stream = await client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": "Ты — старший аналитик. Пиши кратко, по делу, без markdown."},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=900,
            stream=True,
        )
        parts: list[str] = []
        async for chunk in stream:
            if not getattr(chunk, "choices", None):
                continue
            delta = chunk.choices[0].delta
            if getattr(delta, "content", None):
                parts.append(delta.content)
        raw_content = "".join(parts)
        content = re.sub(r"<think>.*?</think>", "", raw_content, flags=re.DOTALL).strip()
        if not content:
            # На случай если модель не закрыла <think> — пробуем выкусить хвост после </think>
            tail = raw_content.rsplit("</think>", 1)
            content = tail[1].strip() if len(tail) == 2 else ""
        if not content:
            # Фолбэк: соберём короткое summary из highlights, чтобы документ не был пустым
            top = blocks_meta[:6]
            lines = [f"BR за {period_label}. Включено {len(blocks_meta)} запросов."]
            for b in top:
                lines.append(f"• {b['title']} ({b['category_title']}): {b['highlights'][:160]}")
            return " ".join(lines)
        return content
    except Exception as e:
        return f"_Не удалось сгенерировать executive summary: {type(e).__name__}: {e}_"


@router.post("/sessions/{session_id}/build_br")
async def build_br(session_id: str, body: BuildBRRequest) -> dict[str, Any]:
    s = session_store.get_session(session_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if not body.question_ids:
        raise HTTPException(status_code=400, detail="question_ids must not be empty")

    resolved, categories = _resolve_questions(body.question_ids)
    if not resolved:
        raise HTTPException(status_code=400, detail="no valid questions resolved")

    cat_by_id = {c["id"]: c for c in categories}

    blocks_meta: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    public_url = settings.t2d_public_url

    for q in resolved:
        cat = cat_by_id.get(q["category"], {"id": q["category"], "title": q["category"]})
        sql = _format_sql(q["sql"], body.period)
        try:
            df = execute_select(sql, max_rows=1000)
        except Exception as e:
            errors.append({"id": q["id"], "error": f"{type(e).__name__}: {e}"})
            continue

        try:
            content_md, _summary = render_sm_query(df, {}, public_url)
        except Exception as e:
            errors.append({"id": q["id"], "error": f"render: {type(e).__name__}: {e}"})
            continue

        blocks_meta.append({
            "id": q["id"],
            "category_id": cat["id"],
            "category_title": cat["title"],
            "title": q["title"],
            "desc": q.get("desc", ""),
            "content_md": content_md,
            "highlights": _df_highlights(df),
        })

    if not blocks_meta:
        # все упали
        raise HTTPException(
            status_code=500,
            detail={"message": "all queries failed", "errors": errors},
        )

    # Executive summary
    exec_summary = await _exec_summary_llm(body.period.label, body.interview, blocks_meta)

    # Сборка markdown
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    audience = body.interview.audience or "—"
    parts: list[str] = []
    parts.append(f"# Business Review · {body.period.label}")
    parts.append(f"_Подготовлено для: {audience} · {ts}_")
    parts.append("")
    parts.append("## Executive Summary")
    parts.append(exec_summary)
    parts.append("")

    # group blocks by category, keep order of first occurrence
    cat_order: list[str] = []
    by_cat: dict[str, list[dict[str, Any]]] = {}
    for b in blocks_meta:
        cid = b["category_id"]
        if cid not in by_cat:
            by_cat[cid] = []
            cat_order.append(cid)
        by_cat[cid].append(b)

    for cid in cat_order:
        cat = cat_by_id.get(cid, {"id": cid, "title": cid})
        parts.append(f"## {cat['title']}")
        parts.append("")
        for b in by_cat[cid]:
            parts.append(f"### {b['title']}")
            if b["desc"]:
                parts.append(f"_{b['desc']}_")
                parts.append("")
            parts.append(b["content_md"])
            parts.append("")

    if errors:
        parts.append("---")
        parts.append("")
        parts.append("### Технические ошибки")
        parts.append("")
        for e in errors:
            parts.append(f"- `{e['id']}`: {e['error']}")
        parts.append("")

    markdown = "\n".join(parts)

    # Save in session
    session_store.update_session(
        session_id,
        br_markdown=markdown,
        br_questions=body.question_ids,
        br_period_label=body.period.label,
        state="готов",
    )

    return {
        "markdown": markdown,
        "stats": {
            "questions_run": len(blocks_meta),
            "questions_total": len(resolved),
            "errors": len(errors),
        },
        "errors": errors,
    }


@router.get("/sessions/{session_id}/br")
async def get_br(session_id: str) -> dict[str, Any]:
    s = session_store.get_session(session_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if not s.br_markdown:
        raise HTTPException(status_code=404, detail="BR not built yet")
    return {
        "markdown": s.br_markdown,
        "period_label": s.br_period_label,
        "state": s.state,
        "questions": s.br_questions,
    }
