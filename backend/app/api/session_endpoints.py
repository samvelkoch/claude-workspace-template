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

router = APIRouter()

_EXCEL_RENDERERS = {
    "excel_info": render_excel_info,
    "excel_aggregate": render_excel_aggregate,
    "excel_time_series": render_excel_time_series,
}

_SYSTEM_PROMPT: str | None = None


def _get_system_prompt(file_id: str | None) -> str:
    global _SYSTEM_PROMPT
    if _SYSTEM_PROMPT is None:
        path = Path("prompts/excel_br.md")
        _SYSTEM_PROMPT = path.read_text(encoding="utf-8") if path.exists() else ""
    if file_id:
        return _SYSTEM_PROMPT + f"\n\nfile_id текущего файла: {file_id}"
    return _SYSTEM_PROMPT


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
    system = _get_system_prompt(s.file_id)
    all_messages = [{"role": "system", "content": system}] + history

    content = await _run_pipeline(all_messages, s.file_id)

    session_store.append_message(session_id, "assistant", content)
    return {"content": content}


async def _run_pipeline(messages: list[dict], file_id: str | None) -> str:
    client = get_llm_client()
    has_excel = file_id is not None

    resp = await client.chat.completions.create(
        model=settings.llm_model,
        messages=messages,
        tools=EXCEL_TOOLS if has_excel else [],
        tool_choice="auto" if has_excel else "none",
    )

    msg = resp.choices[0].message
    tool_calls = msg.tool_calls or []

    if not tool_calls:
        return msg.content or ""

    messages.append(msg.model_dump(exclude_none=True))
    rich_parts: list[str] = []

    for tc in tool_calls:
        fn_name = tc.function.name
        fn_args: dict[str, Any] = json.loads(tc.function.arguments)

        if has_excel and fn_name.startswith("excel_") and "file_id" not in fn_args:
            fn_args["file_id"] = file_id

        raw = excel_dispatch(fn_name, fn_args)
        renderer = _EXCEL_RENDERERS.get(fn_name)
        if renderer:
            rich_content, _ = renderer(raw, fn_args, settings.t2d_public_url)
            rich_parts.append(rich_content)

        tool_content = raw if isinstance(raw, str) else (
            raw.to_markdown(index=False) if hasattr(raw, "to_markdown") else
            json.dumps(raw, ensure_ascii=False, default=str)
        )
        messages.append({"role": "tool", "tool_call_id": tc.id, "content": tool_content})

    resp2 = await client.chat.completions.create(
        model=settings.llm_model,
        messages=messages,
        max_tokens=4096,
    )
    final_text = resp2.choices[0].message.content or ""

    if rich_parts:
        return "\n\n".join(rich_parts) + "\n\n" + final_text
    return final_text
