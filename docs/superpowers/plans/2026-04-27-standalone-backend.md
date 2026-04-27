# Standalone FastAPI Backend — Plan

**Цель:** Standalone FastAPI-бэкенд для React-фронта. Без OWUI, без SQL Server.

**Стек:** FastAPI, OpenAI SDK → внутренний Qwen-прокси, pandas, pyarrow, openpyxl, plotly.

---

## Архитектурные решения

### Сессии (ключевое изменение v2)
Фронт теперь работает с сессиями. Каждая сессия = { id, title, project_name, file_id, messages[], state }.
- Хранилище: JSON-файл на диске (`/tmp/t2d_br_sessions.json`) — MVP, без БД
- Проекты = папки с цветом, хранятся в том же JSON
- Чат: `POST /sessions/{id}/chat` — бэк грузит историю, добавляет новое сообщение, шлёт LLM

### file_id transport
Фронт передаёт `session_id` в чат-запросе. Бэк читает `file_id` из сессии — не нужно передавать явно.

### LLM
`AsyncOpenAI` с `base_url=LLM_BASE_URL` (внутренний Qwen). Паттерн из owui.

### Streaming
Не нужен для MVP. Фронт показывает progress bar.

### excel_br модули
Копируются из owui почти без изменений.

---

## Структура backend/

```
backend/
├── pyproject.toml
├── .env.example
├── prompts/
│   └── excel_br.md
└── app/
    ├── __init__.py
    ├── main.py
    ├── core/
    │   ├── __init__.py
    │   └── config.py
    ├── llm/
    │   ├── __init__.py
    │   └── client.py
    ├── sessions/
    │   ├── __init__.py
    │   ├── store.py           # JSON-хранилище сессий и проектов
    │   └── models.py          # Pydantic модели Session, Project
    ├── excel_br/              # скопировать из owui
    │   ├── __init__.py
    │   ├── source.py
    │   ├── parser.py
    │   ├── queries.py
    │   ├── tools.py
    │   └── render.py
    └── api/
        ├── __init__.py
        ├── excel_endpoints.py # POST /excel/upload
        ├── session_endpoints.py # GET/POST /sessions, /projects, /sessions/{id}/chat
        └── charts.py          # GET /charts/{filename}
```

---

## Task 1: Scaffold

- [ ] Создать `backend/pyproject.toml`

```toml
[project]
name = "talk2data-br"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.30",
    "pydantic-settings>=2.5",
    "pydantic>=2.0",
    "pandas>=2.2",
    "pyarrow>=17.0",
    "openpyxl>=3.1",
    "plotly>=5.22",
    "tabulate>=0.9",
    "openai>=1.55",
    "python-multipart>=0.0.9",
    "httpx>=0.27",
]

[dependency-groups]
dev = [
    "pytest>=8.3",
    "pytest-asyncio>=0.24",
    "httpx>=0.27",
    "ruff>=0.6",
]
```

- [ ] Создать `backend/.env.example`

```
LLM_BASE_URL=http://internal-llm-proxy/v1
LLM_API_KEY=sk-internal
LLM_MODEL=Qwen/Qwen3.5-122B-A10B-GPTQ-Int4
LLM_TIMEOUT=120
LLM_TRUST_ENV=false
T2D_PUBLIC_URL=http://localhost:8000
SESSIONS_PATH=/tmp/t2d_br_sessions.json
CHARTS_DIR=/tmp/t2d_br_charts
```

- [ ] Создать `backend/app/core/config.py`

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    llm_base_url: str
    llm_api_key: str
    llm_model: str = "Qwen/Qwen3.5-122B-A10B-GPTQ-Int4"
    llm_timeout: int = 120
    llm_trust_env: bool = False
    t2d_public_url: str = "http://localhost:8000"
    sessions_path: str = "/tmp/t2d_br_sessions.json"
    charts_dir: str = "/tmp/t2d_br_charts"

settings = Settings()
```

- [ ] Создать `backend/app/llm/client.py`

```python
import httpx
from openai import AsyncOpenAI
from app.core.config import settings

_client: AsyncOpenAI | None = None

def get_llm_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            base_url=settings.llm_base_url,
            api_key=settings.llm_api_key,
            timeout=settings.llm_timeout,
            http_client=httpx.AsyncClient(trust_env=settings.llm_trust_env),
        )
    return _client
```

- [ ] Создать пустые `__init__.py` во всех пакетах
- [ ] **Коммит:** `feat(backend): scaffold — config, llm client, structure`

---

## Task 2: Скопировать excel_br из owui

Источник: `../services-ai-talk2data-owui/app/excel_br/`

- [ ] Скопировать `source.py`, `parser.py`, `queries.py`, `tools.py`
- [ ] Скопировать `render.py`, заменить `_CHARTS_DIR`:

```python
from app.core.config import settings
_CHARTS_DIR = Path(settings.charts_dir)
_CHARTS_DIR.mkdir(parents=True, exist_ok=True)
```

- [ ] Создать `backend/prompts/excel_br.md`:

```markdown
# Excel BR режим

Пользователь загрузил Excel-файл с данными командировок. file_id файла доступен в контексте.

Алгоритм:
1. Первым вызови excel_info(file_id) чтобы понять структуру: колонки, типы, диапазоны.
2. Отвечай на вопросы через excel_aggregate (группировки, рейтинги, доли) и excel_time_series (тренды).
3. chart_type: bar для рейтингов/сравнений, pie для долей (≤6 категорий), auto по умолчанию.
4. Давай интерпретацию: что значат цифры, что необычно, на что обратить внимание.
5. Отвечай на русском языке.
```

- [ ] **Коммит:** `feat(backend): copy excel_br modules from owui`

---

## Task 3: POST /excel/upload

Файл: `backend/app/api/excel_endpoints.py`

```python
from fastapi import APIRouter, File, HTTPException, UploadFile
from app.excel_br.parser import parse_excel

router = APIRouter(prefix="/excel", tags=["excel"])

_ALLOWED_EXTENSIONS = {".xlsx", ".xls"}
_MAX_SIZE_BYTES = 50 * 1024 * 1024

@router.post("/upload")
async def upload_excel(file: UploadFile = File(...)) -> dict:
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Только .xlsx и .xls файлы")
    content = await file.read()
    if len(content) > _MAX_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Файл больше 50 МБ")
    try:
        info = parse_excel(content, filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Не удалось прочитать файл: {e}")
    return info
```

- [ ] **Коммит:** `feat(backend): add POST /excel/upload`

---

## Task 4: Session store + models

Файлы: `backend/app/sessions/models.py`, `backend/app/sessions/store.py`

### models.py

```python
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

class Project(BaseModel):
    name: str
    color: str = "var(--accent)"
    session_ids: list[str] = Field(default_factory=list)

class Store(BaseModel):
    sessions: dict[str, Session] = Field(default_factory=dict)
    projects: dict[str, Project] = Field(default_factory=dict)
```

### store.py

```python
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
```

- [ ] **Коммит:** `feat(backend): add session store and models`

---

## Task 5: Session API endpoints + chat

Файл: `backend/app/api/session_endpoints.py`

```python
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
```

- [ ] **Коммит:** `feat(backend): add session CRUD and POST /sessions/{id}/chat`

---

## Task 6: GET /charts/{filename} + main.py

Файл: `backend/app/api/charts.py`

```python
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.core.config import settings

router = APIRouter()

@router.get("/charts/{filename}")
async def get_chart(filename: str) -> FileResponse:
    path = Path(settings.charts_dir) / filename
    if not path.exists() or path.suffix not in (".png", ".html"):
        raise HTTPException(status_code=404, detail="Chart not found")
    media_type = "image/png" if path.suffix == ".png" else "text/html; charset=utf-8"
    return FileResponse(path, media_type=media_type)
```

Файл: `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.excel_endpoints import router as excel_router
from app.api.session_endpoints import router as session_router
from app.api.charts import router as charts_router

app = FastAPI(title="Talk2Data BR", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(excel_router)
app.include_router(session_router)
app.include_router(charts_router)

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
```

- [ ] **Коммит:** `feat(backend): add charts endpoint, main.py with CORS`

---

## Task 7: Фронт — интеграция сессий

- [ ] `POST /sessions` при начале нового BR (после загрузки файла)
- [ ] `POST /sessions/{id}/chat` вместо `/v1/chat/completions`
- [ ] `GET /sessions` при старте → заполнить sidebar
- [ ] Sidebar: pinned, проекты (folders), недавние сессии

**Эндпоинты:**

| Метод | Путь | Когда вызывается |
|-------|------|-----------------|
| `GET /sessions` | при запуске приложения | загрузить историю для sidebar |
| `POST /sessions` | после загрузки файла + выбора сценария | создать сессию |
| `POST /sessions/{id}/chat` | при отправке сообщения | вместо `/v1/chat/completions` |
| `PATCH /sessions/{id}` | при завершении BR | `state: "готов"` |
| `GET /projects` | при запуске | загрузить проекты для sidebar |
| `POST /projects` | когда пользователь создаёт папку | |

- [ ] **Коммит:** `feat(frontend): integrate session API`

---

## Task 8: Progress bar в ChatShell

- [ ] Thin animated bar под header (`loading` prop)
- [ ] **Коммит:** `feat(frontend): add indeterminate progress bar`

---

## Итог

После выполнения:
- Сессии хранятся на бэке (JSON), восстанавливаются при перезагрузке
- Sidebar: папки → файлы → сессии (дерево)
- Home screen: добро пожаловать + проекты + недавние сессии
- Чат привязан к сессии, история не теряется
- `POST /excel/upload` → `POST /sessions` → `POST /sessions/{id}/chat`
