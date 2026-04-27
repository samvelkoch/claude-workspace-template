import json
from pathlib import Path
from threading import Lock
from app.core.config import settings
from app.sessions.models import Session, Project, Store

_lock = Lock()
_store: Store | None = None


def _path() -> Path:
    return Path(settings.sessions_path)


def _load() -> Store:
    global _store
    if _store is None:
        p = _path()
        if p.exists():
            _store = Store.model_validate_json(p.read_text())
        else:
            _store = Store()
    return _store


def _save(store: Store) -> None:
    _path().write_text(store.model_dump_json(indent=2))


# ── Session CRUD ─────────────────────────────────────

def list_sessions() -> list[Session]:
    with _lock:
        store = _load()
        return sorted(store.sessions.values(), key=lambda s: s.updated_at, reverse=True)


def get_session(session_id: str) -> Session | None:
    with _lock:
        return _load().sessions.get(session_id)


def create_session(title: str, project_name: str | None, file_id: str | None, file_name: str | None) -> Session:
    with _lock:
        store = _load()
        s = Session(title=title, project_name=project_name, file_id=file_id, file_name=file_name)
        store.sessions[s.id] = s
        if project_name and project_name in store.projects:
            store.projects[project_name].session_ids.append(s.id)
        _save(store)
        return s


def update_session(session_id: str, **kwargs) -> Session | None:
    from datetime import datetime
    with _lock:
        store = _load()
        s = store.sessions.get(session_id)
        if s is None:
            return None
        for k, v in kwargs.items():
            setattr(s, k, v)
        s.updated_at = datetime.now().isoformat()
        _save(store)
        return s


def append_message(session_id: str, role: str, content: str) -> Session | None:
    from app.sessions.models import ChatMessage
    from datetime import datetime
    with _lock:
        store = _load()
        s = store.sessions.get(session_id)
        if s is None:
            return None
        s.messages.append(ChatMessage(role=role, content=content))
        s.updated_at = datetime.now().isoformat()
        _save(store)
        return s


# ── Project CRUD ─────────────────────────────────────

def list_projects() -> list[Project]:
    with _lock:
        return list(_load().projects.values())


def create_project(name: str, color: str = "var(--accent)") -> Project:
    with _lock:
        store = _load()
        p = Project(name=name, color=color)
        store.projects[name] = p
        _save(store)
        return p
