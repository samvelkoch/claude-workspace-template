from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field
import uuid
from datetime import datetime

SessionState = Literal["диалог", "готов", "черновик"]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class Session(BaseModel):
    id: str = Field(default_factory=lambda: uuid.uuid4().hex[:8])
    title: str = "Новая сессия"
    project_name: str | None = None
    file_id: str | None = None
    file_name: str | None = None
    state: SessionState = "диалог"
    pinned: bool = False
    messages: list[ChatMessage] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    # Business Review artefacts
    br_markdown: str | None = None
    br_questions: list[str] = Field(default_factory=list)
    br_period_label: str | None = None


class Project(BaseModel):
    name: str
    color: str = "var(--accent)"
    session_ids: list[str] = Field(default_factory=list)


class Store(BaseModel):
    sessions: dict[str, Session] = Field(default_factory=dict)
    projects: dict[str, Project] = Field(default_factory=dict)
