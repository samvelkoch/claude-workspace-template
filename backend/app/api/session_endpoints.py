import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.llm.client import get_llm_client
from app.sessions import store as session_store
from app.sessions.models import Session
from app.excel_br.tools import EXCEL_TOOLS, dispatch_tool as excel_dispatch
from app.excel_br.render import render_excel_info, render_excel_aggregate, render_excel_time_series
from app.sm_db.tools import SM_TOOLS, dispatch_tool as sm_dispatch
from app.sm_db.render import (
    render_sm_query,
    render_sm_distinct_values,
    render_sm_custom_properties,
)
from app.sm_db.schema import get_schema_summary

router = APIRouter()

_EXCEL_RENDERERS = {
    "excel_info": render_excel_info,
    "excel_aggregate": render_excel_aggregate,
    "excel_time_series": render_excel_time_series,
}

_SM_RENDERERS = {
    "sm_query": render_sm_query,
    "sm_distinct_values": render_sm_distinct_values,
    "sm_custom_properties": render_sm_custom_properties,
}

_SYSTEM_PROMPT: str | None = None
_SM_DB_PROMPT: str | None = None


def _get_system_prompt(file_id: str | None) -> str:
    global _SYSTEM_PROMPT
    if _SYSTEM_PROMPT is None:
        path = Path("prompts/excel_br.md")
        _SYSTEM_PROMPT = path.read_text(encoding="utf-8") if path.exists() else ""
    if file_id:
        return _SYSTEM_PROMPT + f"\n\nfile_id текущего файла: {file_id}"
    return _SYSTEM_PROMPT


def _get_sm_db_prompt() -> str:
    global _SM_DB_PROMPT
    if _SM_DB_PROMPT is None:
        path = Path("prompts/sm_db.md")
        raw = path.read_text(encoding="utf-8") if path.exists() else ""
        _SM_DB_PROMPT = raw.replace("{schema}", get_schema_summary())
    return _SM_DB_PROMPT


# ── Session endpoints ─────────────────────────────────

class CreateSessionRequest(BaseModel):
    title: str = "Новая сессия"
    project_name: str | None = None
    file_id: str | None = None
    file_name: str | None = None


class CreateProjectRequest(BaseModel):
    name: str
    color: str = "var(--accent)"


class ChatRequest(BaseModel):
    content: str


@router.get("/sessions")
async def list_sessions() -> list[dict]:
    return [s.model_dump(exclude={"messages"}) for s in session_store.list_sessions()]


@router.post("/sessions")
async def create_session(body: CreateSessionRequest) -> dict:
    s = session_store.create_session(body.title, body.project_name, body.file_id, body.file_name)
    return s.model_dump(exclude={"messages"})


@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> dict:
    s = session_store.get_session(session_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return s.model_dump()


@router.patch("/sessions/{session_id}")
async def update_session(session_id: str, body: dict) -> dict:
    allowed = {"title", "state", "pinned", "project_name"}
    kwargs = {k: v for k, v in body.items() if k in allowed}
    s = session_store.update_session(session_id, **kwargs)
    if s is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return s.model_dump(exclude={"messages"})


@router.get("/projects")
async def list_projects() -> list[dict]:
    return [p.model_dump() for p in session_store.list_projects()]


@router.post("/projects")
async def create_project(body: CreateProjectRequest) -> dict:
    p = session_store.create_project(body.name, body.color)
    return p.model_dump()


# ── Chat ─────────────────────────────────────────────

@router.post("/sessions/{session_id}/chat")
async def session_chat(session_id: str, body: ChatRequest) -> dict:
    s = session_store.get_session(session_id)
    if s is None:
        raise HTTPException(status_code=404, detail="Session not found")

    session_store.append_message(session_id, "user", body.content)

    history = [{"role": m.role, "content": m.content} for m in s.messages]
    if s.file_id:
        system = _get_system_prompt(s.file_id)
    elif settings.has_db:
        system = _get_sm_db_prompt()
    else:
        system = _get_system_prompt(None)
    all_messages = [{"role": "system", "content": system}] + history

    content = await _run_pipeline(all_messages, s.file_id)

    session_store.append_message(session_id, "assistant", content)
    return {"content": content}


async def _collect_stream(stream) -> tuple[str, list[dict]]:
    """Собирает стриминговый ответ: (content, tool_calls_list)."""
    content_parts: list[str] = []
    tc_acc: dict[int, dict] = {}

    async for chunk in stream:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta

        if getattr(delta, "content", None):
            content_parts.append(delta.content)

        if getattr(delta, "tool_calls", None):
            for tc_chunk in delta.tool_calls:
                idx = tc_chunk.index
                if idx not in tc_acc:
                    tc_acc[idx] = {"id": "", "name": "", "arguments": ""}
                if tc_chunk.id:
                    tc_acc[idx]["id"] = tc_chunk.id
                if tc_chunk.function:
                    if tc_chunk.function.name:
                        tc_acc[idx]["name"] += tc_chunk.function.name
                    if tc_chunk.function.arguments:
                        tc_acc[idx]["arguments"] += tc_chunk.function.arguments

    content = "".join(content_parts)
    tool_calls = [
        {"id": v["id"], "function": {"name": v["name"], "arguments": v["arguments"]}}
        for v in tc_acc.values()
        if v["name"]
    ]
    return content, tool_calls


async def _run_pipeline(messages: list[dict], file_id: str | None) -> str:
    client = get_llm_client()

    has_excel = file_id is not None
    has_db = (not has_excel) and settings.has_db

    if has_excel:
        tools = EXCEL_TOOLS
    elif has_db:
        tools = SM_TOOLS
    else:
        tools = []

    stream = await client.chat.completions.create(
        model=settings.llm_model,
        messages=messages,
        tools=tools,
        tool_choice="auto" if tools else "none",
        stream=True,
    )
    content, tool_calls = await _collect_stream(stream)

    if not tool_calls:
        return _strip_think_tags(content)

    rich_parts: list[str] = []
    max_rounds = 4
    rounds = 0

    while tool_calls and rounds < max_rounds:
        # Добавим assistant-сообщение с tool_calls в историю
        assistant_msg = {
            "role": "assistant",
            "content": content or None,
            "tool_calls": [
                {"id": tc["id"], "type": "function", "function": tc["function"]}
                for tc in tool_calls
            ],
        }
        messages.append(assistant_msg)

        for tc in tool_calls:
            fn_name = tc["function"]["name"]
            try:
                fn_args: dict[str, Any] = json.loads(tc["function"]["arguments"] or "{}")
            except json.JSONDecodeError:
                fn_args = {}

            try:
                if has_excel and fn_name.startswith("excel_"):
                    if "file_id" not in fn_args:
                        fn_args["file_id"] = file_id
                    raw = excel_dispatch(fn_name, fn_args)
                    renderer = _EXCEL_RENDERERS.get(fn_name)
                elif fn_name.startswith("sm_"):
                    raw = sm_dispatch(fn_name, fn_args)
                    renderer = _SM_RENDERERS.get(fn_name)
                else:
                    raw = f"Unknown tool: {fn_name}"
                    renderer = None
            except Exception as e:
                raw = f"Ошибка инструмента {fn_name}: {type(e).__name__}: {e}"
                renderer = None

            if renderer is not None:
                try:
                    rich_content, _summary = renderer(raw, fn_args, settings.t2d_public_url)
                    rich_parts.append(rich_content)
                except Exception as e:
                    rich_parts.append(f"_Ошибка рендеринга {fn_name}: {e}_")

            tool_content = _stringify_tool_result(raw)
            messages.append({
                "role": "tool",
                "tool_call_id": tc["id"],
                "content": tool_content,
            })

        rounds += 1
        stream_n = await client.chat.completions.create(
            model=settings.llm_model,
            messages=messages,
            tools=tools,
            tool_choice="auto" if tools else "none",
            max_tokens=4096,
            stream=True,
        )
        content, tool_calls = await _collect_stream(stream_n)

    final_text = _strip_think_tags(content)

    if rich_parts:
        return "\n\n".join(rich_parts) + "\n\n" + final_text
    return final_text


def _strip_think_tags(content: str) -> str:
    import re
    return re.sub(r"<think>.*?</think>", "", content or "", flags=re.DOTALL).strip()


def _stringify_tool_result(raw: Any) -> str:
    """Сериализация tool-результата для отправки модели."""
    if isinstance(raw, str):
        return raw
    if hasattr(raw, "to_markdown"):
        try:
            return raw.to_markdown(index=False)
        except Exception:
            pass
    try:
        return json.dumps(raw, ensure_ascii=False, default=str)
    except Exception:
        return str(raw)
