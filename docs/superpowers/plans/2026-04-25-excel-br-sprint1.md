# Excel BR Sprint 1: Upload + Free Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить в Talk2Data загрузку Excel через OWUI Native Tool и свободный чат с данными через три LLM-инструмента (excel_info, excel_aggregate, excel_time_series).

**Architecture:** Excel загружается через `POST /excel/upload`, конвертируется в Parquet на диск, регистрируется по `file_id`. LLM-инструменты читают нужные колонки через `ParquetSource` (DataSource-протокол — в будущем заменяется на DatabaseSource без изменений в инструментах). OWUI Native Tool вызывает upload автоматически при прикреплении файла и инжектирует `file_id` в контекст разговора.

**Tech Stack:** FastAPI, pandas, pyarrow, openpyxl, plotly, pytest

---

## File Map

| Действие | Файл | Ответственность |
|----------|------|----------------|
| CREATE | `app/excel_br/__init__.py` | пустой модуль |
| CREATE | `app/excel_br/source.py` | DataSource протокол + ParquetSource |
| CREATE | `app/excel_br/parser.py` | parse_excel() → Parquet + in-memory registry |
| CREATE | `app/excel_br/queries.py` | excel_info(), excel_aggregate(), excel_time_series() |
| CREATE | `app/excel_br/tools.py` | EXCEL_TOOLS (OpenAI schema) + dispatch_tool() |
| CREATE | `app/excel_br/render.py` | render_excel_info/aggregate/time_series() |
| CREATE | `app/api/excel_endpoints.py` | POST /excel/upload |
| MODIFY | `app/main.py` | подключить excel_router |
| MODIFY | `app/api/openai_compat.py` | добавить EXCEL_TOOLS, детектировать file_id |
| CREATE | `prompts/excel_br.md` | системный промпт для Excel-режима |
| CREATE | `context/owui_excel_tool.json` | OpenAPI spec для OWUI Native Tool |
| CREATE | `tests/test_excel_parser.py` | тесты парсинга и registry |
| CREATE | `tests/test_excel_queries.py` | тесты трёх query-функций |
| CREATE | `tests/test_excel_tools.py` | тесты dispatch_tool() и OpenAI schema |
| CREATE | `tests/test_excel_upload.py` | тесты HTTP endpoint |

---

## Task 1: DataSource протокол и ParquetSource

**Files:**
- Create: `app/excel_br/__init__.py`
- Create: `app/excel_br/source.py`
- Test: `tests/test_excel_queries.py` (fixture используется во всех query-тестах)

- [ ] **Шаг 1: Создать пустой `__init__.py`**

```python
# app/excel_br/__init__.py
```

- [ ] **Шаг 2: Написать failing тест для ParquetSource**

Создать `tests/test_excel_queries.py`:

```python
import io
import pandas as pd
import pytest
from pathlib import Path


@pytest.fixture
def sample_parquet(tmp_path) -> tuple[str, Path]:
    """Создаёт тестовый Parquet-файл, возвращает (file_id, path)."""
    df = pd.DataFrame({
        "Тип услуги": ["Авиа", "Жд", "Авиа", "Отель", "Авиа"],
        "Сумма": [15000.0, 3000.0, 12000.0, 8000.0, 9500.0],
        "Дата": pd.to_datetime(["2024-01-15", "2024-02-10", "2024-03-05", "2024-01-20", "2024-02-28"]),
        "GDS": ["Sabre", "РЖД", "Sabre", "Sabre", "Amadeus"],
    })
    file_id = "test1234"
    path = tmp_path / f"{file_id}.parquet"
    df.to_parquet(path, index=False)
    return file_id, path


def test_parquet_source_get_df(sample_parquet, monkeypatch):
    file_id, parquet_path = sample_parquet
    from app.excel_br import source as src_module
    monkeypatch.setattr(src_module.ParquetSource, "_EXCEL_DIR", parquet_path.parent)

    from app.excel_br.source import ParquetSource
    source = ParquetSource()
    df = source.get_df(file_id)

    assert len(df) == 5
    assert "Тип услуги" in df.columns


def test_parquet_source_get_df_columns(sample_parquet, monkeypatch):
    file_id, parquet_path = sample_parquet
    from app.excel_br import source as src_module
    monkeypatch.setattr(src_module.ParquetSource, "_EXCEL_DIR", parquet_path.parent)

    from app.excel_br.source import ParquetSource
    source = ParquetSource()
    df = source.get_df(file_id, columns=["Тип услуги", "Сумма"])

    assert list(df.columns) == ["Тип услуги", "Сумма"]


def test_parquet_source_missing_file(tmp_path):
    from app.excel_br import source as src_module
    source = src_module.ParquetSource()
    source._EXCEL_DIR = tmp_path
    with pytest.raises(FileNotFoundError):
        source.get_df("nonexistent")
```

- [ ] **Шаг 3: Запустить тест — убедиться что FAIL**

```bash
cd /ds/samvel.kocharyan/claude-workspace/services-ai-talk2data-owui
python -m pytest tests/test_excel_queries.py::test_parquet_source_get_df -v
```
Ожидаем: `ModuleNotFoundError: No module named 'app.excel_br'`

- [ ] **Шаг 4: Создать `app/excel_br/source.py`**

```python
"""DataSource протокол + ParquetSource реализация."""

from pathlib import Path
from typing import Protocol

import pandas as pd


class DataSource(Protocol):
    def get_df(self, file_id: str, columns: list[str] | None = None) -> pd.DataFrame: ...


class ParquetSource:
    _EXCEL_DIR: Path = Path("/tmp/t2d_excel")

    def get_df(self, file_id: str, columns: list[str] | None = None) -> pd.DataFrame:
        path = self._EXCEL_DIR / f"{file_id}.parquet"
        if not path.exists():
            raise FileNotFoundError(f"file_id={file_id!r} не найден в {self._EXCEL_DIR}")
        return pd.read_parquet(path, columns=columns)


_default_source = ParquetSource()


def get_source() -> ParquetSource:
    return _default_source
```

- [ ] **Шаг 5: Запустить тесты — убедиться что PASS**

```bash
python -m pytest tests/test_excel_queries.py::test_parquet_source_get_df tests/test_excel_queries.py::test_parquet_source_get_df_columns tests/test_excel_queries.py::test_parquet_source_missing_file -v
```
Ожидаем: 3 PASS

- [ ] **Шаг 6: Коммит**

```bash
git add app/excel_br/__init__.py app/excel_br/source.py tests/test_excel_queries.py
git commit -m "feat(excel-br): add DataSource protocol and ParquetSource"
```

---

## Task 2: Excel parser (Excel → Parquet + registry)

**Files:**
- Create: `app/excel_br/parser.py`
- Test: `tests/test_excel_parser.py`

- [ ] **Шаг 1: Написать failing тесты**

Создать `tests/test_excel_parser.py`:

```python
import io
import pandas as pd
import pytest


@pytest.fixture
def excel_bytes() -> bytes:
    """Минимальный Excel-файл в памяти."""
    df = pd.DataFrame({
        "Тип услуги": ["Авиа", "Жд", "Авиа"],
        "Сумма": [15000.0, 3000.0, 12000.0],
        "Дата": pd.to_datetime(["2024-01-15", "2024-02-10", "2024-03-05"]),
    })
    buf = io.BytesIO()
    df.to_excel(buf, index=False, engine="openpyxl")
    return buf.getvalue()


def test_parse_excel_returns_info(excel_bytes, tmp_path, monkeypatch):
    from app.excel_br import parser as parser_module
    monkeypatch.setattr(parser_module, "_EXCEL_DIR", tmp_path)

    from app.excel_br.parser import parse_excel
    info = parse_excel(excel_bytes, "test.xlsx")

    assert info["row_count"] == 3
    assert info["column_count"] == 3
    assert "file_id" in info
    assert len(info["file_id"]) == 8


def test_parse_excel_creates_parquet(excel_bytes, tmp_path, monkeypatch):
    from app.excel_br import parser as parser_module
    monkeypatch.setattr(parser_module, "_EXCEL_DIR", tmp_path)

    from app.excel_br.parser import parse_excel
    info = parse_excel(excel_bytes, "test.xlsx")

    parquet_path = tmp_path / f"{info['file_id']}.parquet"
    assert parquet_path.exists()
    df = pd.read_parquet(parquet_path)
    assert len(df) == 3


def test_parse_excel_detects_date_range(excel_bytes, tmp_path, monkeypatch):
    from app.excel_br import parser as parser_module
    monkeypatch.setattr(parser_module, "_EXCEL_DIR", tmp_path)

    from app.excel_br.parser import parse_excel
    info = parse_excel(excel_bytes, "test.xlsx")

    assert info["date_range"] is not None
    assert info["date_range"]["min"] == "2024-01-15"
    assert info["date_range"]["max"] == "2024-03-05"


def test_parse_excel_registers_file(excel_bytes, tmp_path, monkeypatch):
    from app.excel_br import parser as parser_module
    monkeypatch.setattr(parser_module, "_EXCEL_DIR", tmp_path)
    monkeypatch.setattr(parser_module, "_registry", {})

    from app.excel_br.parser import parse_excel, get_file_info
    info = parse_excel(excel_bytes, "test.xlsx")

    stored = get_file_info(info["file_id"])
    assert stored is not None
    assert stored["filename"] == "test.xlsx"
```

- [ ] **Шаг 2: Запустить — убедиться что FAIL**

```bash
python -m pytest tests/test_excel_parser.py -v
```
Ожидаем: `ModuleNotFoundError: No module named 'app.excel_br.parser'`

- [ ] **Шаг 3: Создать `app/excel_br/parser.py`**

```python
"""parse_excel: Excel bytes → Parquet файл на диск + in-memory registry."""

import io
import uuid
from pathlib import Path

import pandas as pd

_EXCEL_DIR: Path = Path("/tmp/t2d_excel")
_registry: dict[str, dict] = {}


def _ensure_dir() -> None:
    _EXCEL_DIR.mkdir(parents=True, exist_ok=True)


def parse_excel(file_bytes: bytes, filename: str) -> dict:
    _ensure_dir()
    df = pd.read_excel(io.BytesIO(file_bytes), engine="openpyxl")

    file_id = uuid.uuid4().hex[:8]
    parquet_path = _EXCEL_DIR / f"{file_id}.parquet"
    df.to_parquet(parquet_path, index=False, compression="snappy")

    date_cols = df.select_dtypes(include=["datetime64[ns]", "datetime64[us]"]).columns.tolist()
    date_range = None
    if date_cols:
        col = date_cols[0]
        date_range = {
            "min": str(df[col].min().date()),
            "max": str(df[col].max().date()),
        }

    info = {
        "file_id": file_id,
        "filename": filename,
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": df.columns.tolist(),
        "date_range": date_range,
    }
    _registry[file_id] = {**info, "path": str(parquet_path)}
    return info


def get_file_info(file_id: str) -> dict | None:
    return _registry.get(file_id)
```

- [ ] **Шаг 4: Запустить тесты — убедиться что PASS**

```bash
python -m pytest tests/test_excel_parser.py -v
```
Ожидаем: 4 PASS

- [ ] **Шаг 5: Коммит**

```bash
git add app/excel_br/parser.py tests/test_excel_parser.py
git commit -m "feat(excel-br): add Excel→Parquet parser with file registry"
```

---

## Task 3: pandas query-функции

**Files:**
- Create: `app/excel_br/queries.py`
- Test: `tests/test_excel_queries.py` (добавить в существующий файл)

- [ ] **Шаг 1: Добавить failing тесты в `tests/test_excel_queries.py`**

Дописать в конец файла:

```python
# ── query tests ───────────────────────────────────────────────────────────────

@pytest.fixture
def patched_source(sample_parquet, monkeypatch):
    """Подменяет get_source() на ParquetSource с тестовой директорией."""
    file_id, parquet_path = sample_parquet
    from app.excel_br import source as src_module
    monkeypatch.setattr(src_module.ParquetSource, "_EXCEL_DIR", parquet_path.parent)
    monkeypatch.setattr(src_module, "_default_source", src_module.ParquetSource())
    return file_id


def test_excel_info_returns_structure(patched_source):
    from app.excel_br.queries import excel_info
    info = excel_info(patched_source)

    assert info["row_count"] == 5
    assert info["column_count"] == 4
    assert any(c["name"] == "Тип услуги" for c in info["columns"])


def test_excel_info_numeric_range(patched_source):
    from app.excel_br.queries import excel_info
    info = excel_info(patched_source)

    summa = next(c for c in info["columns"] if c["name"] == "Сумма")
    assert summa["min"] == pytest.approx(3000.0)
    assert summa["max"] == pytest.approx(15000.0)
    assert summa["sum"] == pytest.approx(47500.0)


def test_excel_aggregate_sum(patched_source):
    from app.excel_br.queries import excel_aggregate
    df = excel_aggregate(patched_source, groupby=["Тип услуги"], metric="Сумма", agg="sum")

    assert isinstance(df, pd.DataFrame)
    avia = df[df["Тип услуги"] == "Авиа"]["Сумма_sum"].values[0]
    assert avia == pytest.approx(36500.0)


def test_excel_aggregate_top_n(patched_source):
    from app.excel_br.queries import excel_aggregate
    df = excel_aggregate(patched_source, groupby=["Тип услуги"], metric="Сумма", agg="sum", top_n=2)

    assert len(df) == 2


def test_excel_aggregate_with_filter(patched_source):
    from app.excel_br.queries import excel_aggregate
    df = excel_aggregate(
        patched_source,
        groupby=["GDS"],
        metric="Сумма",
        agg="sum",
        filters=[{"col": "Тип услуги", "op": "eq", "val": "Авиа"}],
    )

    assert "GDS_sum" not in df.columns or True  # колонка называется Сумма_sum
    assert len(df) > 0


def test_excel_time_series_monthly(patched_source):
    from app.excel_br.queries import excel_time_series
    df = excel_time_series(patched_source, date_col="Дата", metric_col="count", freq="month")

    assert isinstance(df, pd.DataFrame)
    assert "Дата" in df.columns
    assert "count" in df.columns
    assert len(df) >= 3


def test_excel_time_series_sum(patched_source):
    from app.excel_br.queries import excel_time_series
    df = excel_time_series(patched_source, date_col="Дата", metric_col="Сумма", freq="month")

    assert "Сумма" in df.columns
    assert df["Сумма"].sum() == pytest.approx(47500.0)
```

- [ ] **Шаг 2: Запустить — убедиться что FAIL**

```bash
python -m pytest tests/test_excel_queries.py -k "test_excel_info or test_excel_aggregate or test_excel_time_series" -v
```
Ожидаем: `ModuleNotFoundError: No module named 'app.excel_br.queries'`

- [ ] **Шаг 3: Создать `app/excel_br/queries.py`**

```python
"""pandas query-функции для Excel-данных. Работают через DataSource протокол."""

from typing import Any

import pandas as pd

from app.excel_br.source import get_source


def excel_info(file_id: str) -> dict[str, Any]:
    """Структура файла: колонки, типы, диапазоны значений."""
    source = get_source()
    df = source.get_df(file_id)

    col_info: list[dict] = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        n_unique = int(df[col].nunique())
        entry: dict[str, Any] = {
            "name": col,
            "dtype": dtype,
            "n_unique": n_unique,
            "n_null": int(df[col].isna().sum()),
        }
        if pd.api.types.is_numeric_dtype(df[col]):
            entry["min"] = float(df[col].min())
            entry["max"] = float(df[col].max())
            entry["sum"] = float(df[col].sum())
        elif n_unique <= 50:
            entry["top_values"] = df[col].value_counts().head(5).index.tolist()
        col_info.append(entry)

    return {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": col_info,
    }


def _apply_filters(df: pd.DataFrame, filters: list[dict] | None) -> pd.DataFrame:
    for f in (filters or []):
        col, op, val = f["col"], f["op"], f["val"]
        if op == "eq":
            df = df[df[col] == val]
        elif op == "gt":
            df = df[df[col] > val]
        elif op == "lt":
            df = df[df[col] < val]
        elif op == "in":
            df = df[df[col].isin(val)]
    return df


def excel_aggregate(
    file_id: str,
    groupby: list[str],
    metric: str,
    agg: str,
    filters: list[dict] | None = None,
    top_n: int | None = None,
) -> pd.DataFrame:
    """Группировка + агрегация + опциональные фильтры и топ-N."""
    source = get_source()
    filter_cols = [f["col"] for f in (filters or [])]
    cols_needed = list(dict.fromkeys(groupby + [metric] + filter_cols))
    df = source.get_df(file_id, columns=cols_needed)
    df = _apply_filters(df, filters)

    agg_fn = {"sum": "sum", "count": "count", "mean": "mean", "median": "median", "nunique": "nunique"}[agg]
    result = df.groupby(groupby)[metric].agg(agg_fn).reset_index()
    result.columns = list(groupby) + [f"{metric}_{agg}"]
    result = result.sort_values(f"{metric}_{agg}", ascending=False)
    if top_n:
        result = result.head(top_n)
    return result.reset_index(drop=True)


def excel_time_series(
    file_id: str,
    date_col: str,
    metric_col: str,
    freq: str,
    filters: list[dict] | None = None,
) -> pd.DataFrame:
    """Тренд по времени: resample по периоду."""
    source = get_source()
    filter_cols = [f["col"] for f in (filters or [])]
    extra = [] if metric_col == "count" else [metric_col]
    cols_needed = list(dict.fromkeys([date_col] + extra + filter_cols))
    df = source.get_df(file_id, columns=cols_needed)
    df[date_col] = pd.to_datetime(df[date_col])
    df = _apply_filters(df, filters)

    freq_map = {"month": "ME", "week": "W", "quarter": "QE", "year": "YE"}
    pd_freq = freq_map.get(freq, "ME")

    if metric_col == "count":
        result = df.resample(pd_freq, on=date_col).size().reset_index(name="count")
    else:
        result = df.resample(pd_freq, on=date_col)[metric_col].sum().reset_index()

    result[date_col] = result[date_col].dt.strftime("%Y-%m-%d")
    return result
```

- [ ] **Шаг 4: Запустить тесты — убедиться что PASS**

```bash
python -m pytest tests/test_excel_queries.py -v
```
Ожидаем: все PASS

- [ ] **Шаг 5: Коммит**

```bash
git add app/excel_br/queries.py tests/test_excel_queries.py
git commit -m "feat(excel-br): add excel_info, excel_aggregate, excel_time_series queries"
```

---

## Task 4: OpenAI tools schema + dispatch

**Files:**
- Create: `app/excel_br/tools.py`
- Test: `tests/test_excel_tools.py`

- [ ] **Шаг 1: Написать failing тесты**

Создать `tests/test_excel_tools.py`:

```python
import pandas as pd
import pytest
from unittest.mock import patch


def test_excel_tools_schema_valid():
    from app.excel_br.tools import EXCEL_TOOLS
    assert len(EXCEL_TOOLS) == 3
    names = [t["function"]["name"] for t in EXCEL_TOOLS]
    assert "excel_info" in names
    assert "excel_aggregate" in names
    assert "excel_time_series" in names


def test_excel_tools_have_required_fields():
    from app.excel_br.tools import EXCEL_TOOLS
    for tool in EXCEL_TOOLS:
        assert tool["type"] == "function"
        fn = tool["function"]
        assert "name" in fn
        assert "description" in fn
        assert "parameters" in fn
        assert "required" in fn["parameters"]
        assert "file_id" in fn["parameters"]["required"]


def test_dispatch_tool_excel_info():
    mock_info = {"row_count": 5, "column_count": 4, "columns": []}
    with patch("app.excel_br.tools.excel_info", return_value=mock_info) as mock:
        from app.excel_br.tools import dispatch_tool
        result = dispatch_tool("excel_info", {"file_id": "abc12345"})
        mock.assert_called_once_with("abc12345")
        assert result == mock_info


def test_dispatch_tool_excel_aggregate():
    mock_df = pd.DataFrame({"Тип услуги": ["Авиа"], "Сумма_sum": [36500.0]})
    with patch("app.excel_br.tools.excel_aggregate", return_value=mock_df) as mock:
        from app.excel_br.tools import dispatch_tool
        result = dispatch_tool("excel_aggregate", {
            "file_id": "abc12345",
            "groupby": ["Тип услуги"],
            "metric": "Сумма",
            "agg": "sum",
            "top_n": 10,
        })
        mock.assert_called_once_with("abc12345", ["Тип услуги"], "Сумма", "sum", None, 10)
        assert isinstance(result, pd.DataFrame)


def test_dispatch_tool_excel_time_series():
    mock_df = pd.DataFrame({"Дата": ["2024-01-31"], "count": [3]})
    with patch("app.excel_br.tools.excel_time_series", return_value=mock_df) as mock:
        from app.excel_br.tools import dispatch_tool
        result = dispatch_tool("excel_time_series", {
            "file_id": "abc12345",
            "date_col": "Дата",
            "metric_col": "count",
            "freq": "month",
        })
        mock.assert_called_once_with("abc12345", "Дата", "count", "month", None)
        assert isinstance(result, pd.DataFrame)


def test_dispatch_tool_unknown_raises():
    from app.excel_br.tools import dispatch_tool
    with pytest.raises(ValueError, match="Unknown excel tool"):
        dispatch_tool("unknown_tool", {"file_id": "abc12345"})
```

- [ ] **Шаг 2: Запустить — убедиться что FAIL**

```bash
python -m pytest tests/test_excel_tools.py -v
```
Ожидаем: `ModuleNotFoundError: No module named 'app.excel_br.tools'`

- [ ] **Шаг 3: Создать `app/excel_br/tools.py`**

```python
"""OpenAI tool definitions для Excel-анализа и dispatcher."""

from typing import Any

import pandas as pd

from app.excel_br.queries import excel_aggregate, excel_info, excel_time_series

EXCEL_TOOLS: list[dict] = [
    {
        "type": "function",
        "function": {
            "name": "excel_info",
            "description": (
                "Получить структуру загруженного Excel-файла: колонки, типы данных, "
                "диапазоны значений, топ уникальных значений. Вызывать первым после file_id."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "file_id": {"type": "string", "description": "Идентификатор загруженного файла"},
                },
                "required": ["file_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "excel_aggregate",
            "description": (
                "Агрегировать данные из Excel: группировка по колонкам + метрика (sum/count/mean). "
                "Для: топ-направлений, доли по сервисам, расходов по подразделениям, общего объёма."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "file_id": {"type": "string"},
                    "groupby": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Колонки группировки, напр. ['Тип услуги']",
                    },
                    "metric": {"type": "string", "description": "Числовая колонка для агрегации"},
                    "agg": {
                        "type": "string",
                        "enum": ["sum", "count", "mean", "median", "nunique"],
                    },
                    "filters": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "col": {"type": "string"},
                                "op": {"type": "string", "enum": ["eq", "gt", "lt", "in"]},
                                "val": {},
                            },
                            "required": ["col", "op", "val"],
                        },
                        "description": "Фильтры (необязательно)",
                    },
                    "top_n": {"type": "integer", "description": "Вернуть топ N строк (необязательно)"},
                    "chart_type": {
                        "type": "string",
                        "enum": ["bar", "pie", "auto"],
                        "description": "bar для рейтингов, pie для долей (<7 категорий), auto по умолчанию",
                    },
                },
                "required": ["file_id", "groupby", "metric", "agg"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "excel_time_series",
            "description": (
                "Тренд по времени: динамика метрики по месяцам/неделям/кварталам. "
                "Для: динамики транзакций, роста spend, сезонности."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "file_id": {"type": "string"},
                    "date_col": {"type": "string", "description": "Колонка с датой"},
                    "metric_col": {
                        "type": "string",
                        "description": "Числовая колонка или 'count' для подсчёта строк",
                    },
                    "freq": {
                        "type": "string",
                        "enum": ["month", "week", "quarter", "year"],
                        "description": "Периодичность агрегации",
                    },
                    "filters": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "col": {"type": "string"},
                                "op": {"type": "string", "enum": ["eq", "in"]},
                                "val": {},
                            },
                            "required": ["col", "op", "val"],
                        },
                    },
                },
                "required": ["file_id", "date_col", "metric_col", "freq"],
            },
        },
    },
]


def dispatch_tool(name: str, args: dict[str, Any]) -> Any:
    """Вызывает Excel-функцию по имени инструмента."""
    if name == "excel_info":
        return excel_info(args["file_id"])
    if name == "excel_aggregate":
        return excel_aggregate(
            args["file_id"],
            args["groupby"],
            args["metric"],
            args["agg"],
            args.get("filters"),
            args.get("top_n"),
        )
    if name == "excel_time_series":
        return excel_time_series(
            args["file_id"],
            args["date_col"],
            args["metric_col"],
            args["freq"],
            args.get("filters"),
        )
    raise ValueError(f"Unknown excel tool: {name!r}")
```

- [ ] **Шаг 4: Запустить тесты — убедиться что PASS**

```bash
python -m pytest tests/test_excel_tools.py -v
```
Ожидаем: 6 PASS

- [ ] **Шаг 5: Коммит**

```bash
git add app/excel_br/tools.py tests/test_excel_tools.py
git commit -m "feat(excel-br): add EXCEL_TOOLS schema and dispatch_tool"
```

---

## Task 5: Render функции

**Files:**
- Create: `app/excel_br/render.py`

Тесты для render — интеграционные, достаточно проверить что функции возвращают непустые строки (как в FTE).

- [ ] **Шаг 1: Добавить тесты render в `tests/test_excel_tools.py`**

Дописать в конец файла:

```python
def test_render_excel_info_returns_markdown():
    from app.excel_br.render import render_excel_info
    info = {"row_count": 5, "column_count": 3, "columns": [
        {"name": "Тип услуги", "dtype": "object", "n_unique": 3, "n_null": 0, "top_values": ["Авиа", "Жд"]},
        {"name": "Сумма", "dtype": "float64", "n_unique": 5, "n_null": 0, "min": 3000.0, "max": 15000.0, "sum": 47500.0},
    ]}
    content, summary = render_excel_info(info, {}, "http://localhost:8000")
    assert "5" in content
    assert "Тип услуги" in content
    assert isinstance(summary, str)


def test_render_excel_aggregate_returns_chart_link():
    from app.excel_br.render import render_excel_aggregate
    df = pd.DataFrame({"Тип услуги": ["Авиа", "Жд"], "Сумма_sum": [36500.0, 3000.0]})
    content, summary = render_excel_aggregate(df, {"chart_type": "bar"}, "http://localhost:8000")
    assert "http://localhost:8000" in content
    assert isinstance(summary, str)


def test_render_excel_time_series_returns_chart_link():
    from app.excel_br.render import render_excel_time_series
    df = pd.DataFrame({"Дата": ["2024-01-31", "2024-02-29"], "count": [3, 2]})
    content, summary = render_excel_time_series(df, {"date_col": "Дата", "metric_col": "count"}, "http://localhost:8000")
    assert "http://localhost:8000" in content
    assert isinstance(summary, str)
```

- [ ] **Шаг 2: Запустить — убедиться что FAIL**

```bash
python -m pytest tests/test_excel_tools.py::test_render_excel_info_returns_markdown -v
```
Ожидаем: `ImportError`

- [ ] **Шаг 3: Создать `app/excel_br/render.py`**

```python
"""Форматирование результатов Excel-инструментов: Markdown + Plotly HTML."""

import uuid
from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

_CHARTS_DIR = Path("/tmp/t2d_charts")
_CHARTS_DIR.mkdir(exist_ok=True)

_PLOTLY_TEMPLATE = "plotly_dark"
_BAR_COLORS = [
    "#42A5F5", "#64B5F6", "#90CAF9", "#1E88E5", "#1565C0",
    "#7986CB", "#5C6BC0", "#3949AB", "#80DEEA", "#4DD0E1",
]


def _save_html(fig: go.Figure, name: str) -> None:
    html = fig.to_html(include_plotlyjs=True, full_html=True)
    (_CHARTS_DIR / f"{name}.html").write_text(html, encoding="utf-8")


def _chart_link(name: str, public_url: str) -> str:
    return f"\n[📊 Интерактивный график]({public_url}/charts/{name}.html)\n"


def render_excel_info(info: dict, args: dict, public_url: str) -> tuple[str, str]:
    """Возвращает (markdown-описание структуры файла, краткое summary)."""
    lines = [
        f"**Строк:** {info['row_count']:,}  **Колонок:** {info['column_count']}",
        "",
        "| Колонка | Тип | Уникальных | Null | Диапазон / Топ значения |",
        "|---------|-----|-----------|------|------------------------|",
    ]
    for col in info["columns"]:
        if "min" in col:
            extra = f"{col['min']:,.0f} – {col['max']:,.0f} (Σ {col['sum']:,.0f})"
        elif "top_values" in col:
            extra = ", ".join(str(v) for v in col["top_values"][:3])
        else:
            extra = "—"
        lines.append(f"| {col['name']} | {col['dtype']} | {col['n_unique']} | {col['n_null']} | {extra} |")

    content = "\n".join(lines)
    summary = f"Файл: {info['row_count']} строк, {info['column_count']} колонок."
    return content, summary


def render_excel_aggregate(df: pd.DataFrame, args: dict, public_url: str) -> tuple[str, str]:
    """Возвращает (markdown-таблица + ссылка на график, summary)."""
    metric_col = df.columns[-1]
    chart_type = args.get("chart_type", "auto")
    n_rows = len(df)

    name = uuid.uuid4().hex

    if chart_type == "pie" or (chart_type == "auto" and n_rows <= 6):
        label_col = df.columns[0]
        fig = px.pie(df, values=metric_col, names=label_col,
                     template=_PLOTLY_TEMPLATE, color_discrete_sequence=_BAR_COLORS)
    else:
        label_col = df.columns[0] if len(df.columns) == 2 else " + ".join(df.columns[:-1])
        y_col = df.columns[0] if len(df.columns) == 2 else df.apply(
            lambda r: " / ".join(str(r[c]) for c in df.columns[:-1]), axis=1
        )
        if len(df.columns) == 2:
            fig = px.bar(df, x=metric_col, y=df.columns[0], orientation="h",
                         template=_PLOTLY_TEMPLATE, color_discrete_sequence=_BAR_COLORS)
        else:
            df = df.copy()
            df["_label"] = df[df.columns[:-1]].apply(lambda r: " / ".join(str(v) for v in r), axis=1)
            fig = px.bar(df, x=metric_col, y="_label", orientation="h",
                         template=_PLOTLY_TEMPLATE, color_discrete_sequence=_BAR_COLORS)

    _save_html(fig, name)

    md_table = df.to_markdown(index=False)
    content = md_table + _chart_link(name, public_url)
    summary = f"Агрегация: {n_rows} групп, топ значение {df[metric_col].iloc[0]:,.0f}."
    return content, summary


def render_excel_time_series(df: pd.DataFrame, args: dict, public_url: str) -> tuple[str, str]:
    """Возвращает (markdown-таблица + ссылка на line-график, summary)."""
    date_col = args.get("date_col", df.columns[0])
    metric_col = args.get("metric_col", df.columns[-1])
    actual_metric = "count" if metric_col == "count" else metric_col

    name = uuid.uuid4().hex
    fig = px.line(df, x=date_col, y=actual_metric,
                  template=_PLOTLY_TEMPLATE, markers=True,
                  color_discrete_sequence=["#42A5F5"])
    _save_html(fig, name)

    md_table = df.to_markdown(index=False)
    content = md_table + _chart_link(name, public_url)
    total = df[actual_metric].sum()
    summary = f"Тренд: {len(df)} периодов, итого {total:,.0f}."
    return content, summary
```

- [ ] **Шаг 4: Запустить render-тесты — убедиться что PASS**

```bash
python -m pytest tests/test_excel_tools.py -v
```
Ожидаем: все PASS

- [ ] **Шаг 5: Коммит**

```bash
git add app/excel_br/render.py tests/test_excel_tools.py
git commit -m "feat(excel-br): add render functions for info/aggregate/time_series"
```

---

## Task 6: Upload endpoint + main.py

**Files:**
- Create: `app/api/excel_endpoints.py`
- Modify: `app/main.py`
- Test: `tests/test_excel_upload.py`

- [ ] **Шаг 1: Написать failing тесты**

Создать `tests/test_excel_upload.py`:

```python
import io
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch


@pytest.fixture
def client():
    from app.main import app
    return TestClient(app)


@pytest.fixture
def excel_bytes() -> bytes:
    df = pd.DataFrame({
        "Тип услуги": ["Авиа", "Жд"],
        "Сумма": [15000.0, 3000.0],
    })
    buf = io.BytesIO()
    df.to_excel(buf, index=False, engine="openpyxl")
    return buf.getvalue()


def test_upload_excel_success(client, excel_bytes, tmp_path, monkeypatch):
    from app.excel_br import parser as parser_module
    monkeypatch.setattr(parser_module, "_EXCEL_DIR", tmp_path)
    monkeypatch.setattr(parser_module, "_registry", {})

    response = client.post(
        "/excel/upload",
        files={"file": ("test.xlsx", excel_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "file_id" in data
    assert data["row_count"] == 2
    assert data["filename"] == "test.xlsx"


def test_upload_excel_wrong_format(client):
    response = client.post(
        "/excel/upload",
        files={"file": ("test.csv", b"a,b\n1,2", "text/csv")},
    )
    assert response.status_code == 400


def test_upload_excel_corrupted(client):
    response = client.post(
        "/excel/upload",
        files={"file": ("test.xlsx", b"not-an-excel-file", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )
    assert response.status_code == 422
```

- [ ] **Шаг 2: Запустить — убедиться что FAIL**

```bash
python -m pytest tests/test_excel_upload.py -v
```
Ожидаем: `404 Not Found` для `/excel/upload` (роутер не подключён)

- [ ] **Шаг 3: Создать `app/api/excel_endpoints.py`**

```python
"""POST /excel/upload — принимает Excel, возвращает file_id."""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.excel_br.parser import parse_excel

router = APIRouter(prefix="/excel", tags=["excel"])

_ALLOWED_EXTENSIONS = {".xlsx", ".xls"}
_MAX_SIZE_BYTES = 50 * 1024 * 1024  # 50 МБ


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

- [ ] **Шаг 4: Подключить роутер в `app/main.py`**

Добавить две строки в существующий `app/main.py`:

```python
from app.api.excel_endpoints import router as excel_router  # добавить после строки с fte_router
```

```python
app.include_router(excel_router)  # добавить после app.include_router(fte_router)
```

Итоговый `app/main.py`:

```python
"""FastAPI приложение Talk2Data."""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse

from app.api.openai_compat import router as openai_router
from app.api.fte_endpoints import router as fte_router
from app.api.excel_endpoints import router as excel_router

app = FastAPI(
    title="Talk2Data",
    description="Аналитический ассистент по данным DWH.",
    version="0.4.0",
)

app.include_router(openai_router)
app.include_router(fte_router)
app.include_router(excel_router)

_CHARTS_DIR = Path("/tmp/t2d_charts")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/charts/{filename}")
async def get_chart(filename: str) -> FileResponse:
    """Отдаёт PNG или HTML-график по имени файла."""
    path = _CHARTS_DIR / filename
    if not path.exists() or path.suffix not in (".png", ".html"):
        raise HTTPException(status_code=404, detail="Chart not found")
    media_type = "image/png" if path.suffix == ".png" else "text/html; charset=utf-8"
    return FileResponse(path, media_type=media_type)
```

- [ ] **Шаг 5: Запустить upload-тесты — убедиться что PASS**

```bash
python -m pytest tests/test_excel_upload.py -v
```
Ожидаем: 3 PASS

- [ ] **Шаг 6: Коммит**

```bash
git add app/api/excel_endpoints.py app/main.py tests/test_excel_upload.py
git commit -m "feat(excel-br): add POST /excel/upload endpoint"
```

---

## Task 7: Интеграция в pipeline (openai_compat.py)

**Files:**
- Modify: `app/api/openai_compat.py`
- Create: `prompts/excel_br.md`

- [ ] **Шаг 1: Создать `prompts/excel_br.md`**

```markdown
# Excel BR режим

Пользователь загрузил Excel-файл с данными. file_id файла доступен в контексте разговора.

Алгоритм:
1. Первым вызови excel_info(file_id) чтобы понять структуру данных — колонки, типы, диапазоны.
2. Отвечай на вопросы через excel_aggregate (группировки, рейтинги, доли) и excel_time_series (тренды).
3. chart_type: bar для рейтингов/сравнений, pie для долей (≤6 категорий), auto по умолчанию.
4. В ответах давай интерпретацию: что значат цифры, что необычно, на что обратить внимание.
```

- [ ] **Шаг 2: Добавить `_extract_file_id()` и обновить `_get_tools()` в `openai_compat.py`**

В начало файла добавить импорты после существующих:

```python
from app.excel_br.tools import EXCEL_TOOLS, dispatch_tool as excel_dispatch_tool
from app.excel_br.render import render_excel_info, render_excel_aggregate, render_excel_time_series
```

После константы `_SYSTEM_GOD_ADDON` добавить:

```python
_EXCEL_RENDERERS = {
    "excel_info":        render_excel_info,
    "excel_aggregate":   render_excel_aggregate,
    "excel_time_series": render_excel_time_series,
}

_EXCEL_BR_PROMPT: str | None = None


def _get_excel_br_prompt() -> str:
    global _EXCEL_BR_PROMPT
    if _EXCEL_BR_PROMPT is None:
        path = Path("prompts/excel_br.md")
        _EXCEL_BR_PROMPT = path.read_text(encoding="utf-8") if path.exists() else ""
    return _EXCEL_BR_PROMPT


def _extract_file_id(messages: list[dict]) -> str | None:
    """Ищет file_id в истории сообщений (инжектируется OWUI Native Tool)."""
    import re
    for msg in reversed(messages):
        content = msg.get("content") or ""
        m = re.search(r'"file_id"\s*:\s*"([a-f0-9]{8})"', content)
        if m:
            return m.group(1)
    return None
```

Заменить функцию `_get_tools()`:

```python
def _get_tools(god_mode: bool, has_excel: bool = False) -> list[dict]:
    tools = FTE_TOOLS + ([TOOL_EXECUTE_SQL] if god_mode else [])
    if has_excel:
        tools = tools + EXCEL_TOOLS
    return tools
```

Заменить функцию `_get_system_prompt()` чтобы добавлять excel-промпт:

```python
def _get_system_prompt(god_mode: bool = False, file_id: str | None = None) -> str:
    global _SYSTEM_PROMPT, _SYSTEM_PROMPT_GOD
    if _SYSTEM_PROMPT is None:
        prompt_path = Path("prompts/fte.md")
        schema_path = Path("context/fte_schema.md")
        base = prompt_path.read_text(encoding="utf-8") if prompt_path.exists() else ""
        schema = schema_path.read_text(encoding="utf-8") if schema_path.exists() else ""
        _SYSTEM_PROMPT = f"{base}\n\n# Схема данных\n{schema}".strip()
        _SYSTEM_PROMPT_GOD = _SYSTEM_PROMPT + _SYSTEM_GOD_ADDON

    base_prompt = _SYSTEM_PROMPT_GOD if god_mode else _SYSTEM_PROMPT
    if file_id:
        excel_addon = f"\n\n# Excel файл загружен\nfile_id: {file_id}\n\n{_get_excel_br_prompt()}"
        return base_prompt + excel_addon
    return base_prompt
```

Обновить `_run_pipeline()` — добавить `file_id` логику:

```python
async def _run_pipeline(messages: list[dict], god_mode: bool = False) -> str:
    client = get_llm_client()
    file_id = _extract_file_id(messages)
    has_excel = file_id is not None

    all_messages: list[dict] = [
        {"role": "system", "content": _get_system_prompt(god_mode, file_id)},
        *messages,
    ]

    stream = await client.chat.completions.create(
        model=settings.llm_model,
        messages=all_messages,
        tools=_get_tools(god_mode, has_excel),
        tool_choice="auto",
        extra_body=_extra_body(),
        stream=True,
    )
    content, reasoning, tool_calls = await _collect_stream(stream)

    rich_parts: list[str] = []

    if tool_calls:
        assistant_msg: dict = {"role": "assistant", "content": content or None, "tool_calls": [
            {"id": tc["id"], "type": "function", "function": tc["function"]}
            for tc in tool_calls
        ]}
        all_messages.append(assistant_msg)

        for tc in tool_calls:
            fn_name = tc["function"]["name"]
            fn_args = json.loads(tc["function"]["arguments"])

            # Инжектируем file_id если не передан LLM-ом явно
            if has_excel and "file_id" not in fn_args and fn_name.startswith("excel_"):
                fn_args["file_id"] = file_id

            if fn_name.startswith("excel_"):
                raw = excel_dispatch_tool(fn_name, fn_args)
                renderer = _EXCEL_RENDERERS.get(fn_name)
            else:
                sql, sql_params = _sql_for_tool(fn_name, fn_args)
                raw = dispatch_tool(fn_name, fn_args, god_mode=god_mode)
                renderer = _RENDERERS.get(fn_name)
                if renderer:
                    rich_content, _ = renderer(raw, fn_args, settings.t2d_public_url, sql=sql, sql_params=sql_params)
                    rich_parts.append(rich_content)
                tool_content = _to_qwen_content(raw)
                all_messages.append({"role": "tool", "tool_call_id": tc["id"], "content": tool_content})
                continue

            if renderer:
                rich_content, _ = renderer(raw, fn_args, settings.t2d_public_url)
                rich_parts.append(rich_content)
            tool_content = _to_qwen_content(raw)
            all_messages.append({"role": "tool", "tool_call_id": tc["id"], "content": tool_content})

        stream2 = await client.chat.completions.create(
            model=settings.llm_model,
            messages=all_messages,
            max_tokens=4096,
            extra_body={"chat_template_kwargs": {"enable_thinking": False}},
            stream=True,
        )
        content, _, _ = await _collect_stream(stream2)

    qwen_text = _strip_think_tags(content)

    if rich_parts:
        combined = "\n\n".join(rich_parts)
        if reasoning:
            combined += _details_reasoning(reasoning)
        return combined + "\n\n" + qwen_text
    return qwen_text
```

- [ ] **Шаг 3: Запустить полный набор тестов**

```bash
python -m pytest tests/ -v --tb=short
```
Ожидаем: все существующие тесты PASS + новые PASS. Coverage ≥ 95%.

- [ ] **Шаг 4: Коммит**

```bash
git add app/api/openai_compat.py prompts/excel_br.md
git commit -m "feat(excel-br): integrate EXCEL_TOOLS into chat pipeline"
```

---

## Task 8: OWUI Native Tool конфигурация

**Files:**
- Create: `context/owui_excel_tool.json`

- [ ] **Шаг 1: Создать файл конфигурации**

Создать `context/owui_excel_tool.json`:

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Talk2Data Excel Upload",
    "version": "1.0",
    "description": "Загрузка Excel-файлов для анализа в Talk2Data"
  },
  "servers": [
    {"url": "http://talk2data:8000"}
  ],
  "paths": {
    "/excel/upload": {
      "post": {
        "operationId": "upload_excel",
        "summary": "Загрузить Excel-файл для анализа данных. Возвращает file_id для последующих вопросов.",
        "requestBody": {
          "required": true,
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "file": {
                    "type": "string",
                    "format": "binary",
                    "description": "Excel файл (.xlsx или .xls)"
                  }
                },
                "required": ["file"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Файл успешно загружен",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file_id": {"type": "string", "description": "8-символьный идентификатор файла"},
                    "filename": {"type": "string"},
                    "row_count": {"type": "integer"},
                    "column_count": {"type": "integer"},
                    "columns": {"type": "array", "items": {"type": "string"}},
                    "date_range": {
                      "type": "object",
                      "properties": {
                        "min": {"type": "string"},
                        "max": {"type": "string"}
                      }
                    }
                  }
                }
              }
            }
          },
          "400": {"description": "Неверный формат файла"},
          "413": {"description": "Файл > 50 МБ"},
          "422": {"description": "Не удалось прочитать файл"}
        }
      }
    }
  }
}
```

- [ ] **Шаг 2: Добавить инструкции по настройке OWUI в README**

Дописать в конец `context/owui_excel_tool.json` — инструкция хранится в отдельном месте. Создать `docs/owui_excel_setup.md`:

```markdown
# Настройка OWUI Native Tool для Excel

1. Открыть OWUI → Admin Panel → Tools → Add Tool
2. Вставить содержимое `context/owui_excel_tool.json`
3. Сохранить
4. В чате появится кнопка загрузки файла с поддержкой Excel
5. Пользователь прикрепляет .xlsx → OWUI вызывает /excel/upload → file_id в контексте
```

- [ ] **Шаг 3: Финальный прогон всех тестов**

```bash
python -m pytest tests/ -v --cov=app --cov-report=term-missing
```
Ожидаем: coverage ≥ 95%, все PASS.

- [ ] **Шаг 4: Финальный коммит**

```bash
git add context/owui_excel_tool.json docs/owui_excel_setup.md
git commit -m "feat(excel-br): add OWUI Native Tool OpenAPI spec and setup docs"
```

---

## Итог Sprint 1

После выполнения плана:
- `POST /excel/upload` принимает Excel (≤50 МБ), конвертирует в Parquet, возвращает `file_id`
- OWUI Native Tool автоматически вызывает upload при прикреплении файла
- LLM в чате видит `file_id` и использует три инструмента: `excel_info`, `excel_aggregate`, `excel_time_series`
- Результаты рендерятся как Markdown-таблицы + интерактивные Plotly-графики
- DataSource абстракция готова к замене на БД в Sprint 2+
