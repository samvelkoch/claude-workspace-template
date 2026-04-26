# Sprint 1: Excel Upload + Free Chat — Design Spec

**Дата:** 2026-04-25  
**Проект:** Talk2Data OWUI  
**Статус:** Approved

---

## Контекст продукта

Talk2Data Excel BR — сервис-продукт для трёх сценариев работы с корп-тревел данными (S&M отчёты):

| Сценарий | Описание | Sprint |
|----------|----------|--------|
| 1 | Свободный чат с данными Excel | **Sprint 1** (этот) |
| 2.1 | Шаблонный Business Review | Sprint 3 |
| 2.2 | Интервью → кастомный BR | Sprint 4 |
| 2.3 | Каталог вопросов → BR | Sprint 4 |
| — | Генерация Marp HTML презентации | Sprint 2 |

Данные сейчас приходят как Excel от пользователей. В будущем — из БД напрямую. Архитектура проектируется с учётом этого.

---

## Scope Sprint 1

1. OWUI Native Tool для загрузки Excel файла
2. `POST /excel/upload` — парсинг Excel → Parquet, возврат `file_id`
3. Модуль `app/excel_br/` — DataSource абстракция + pandas-инструменты
4. Три LLM-инструмента для свободного чата (Сценарий 1)
5. Интеграция в существующий `_run_pipeline` (добавление EXCEL_TOOLS)

---

## Архитектура

```
OWUI Chat
  └─ Пользователь прикрепляет Excel + пишет сообщение
  └─ OWUI Native Tool "upload_excel"
        → POST /excel/upload (multipart/form-data)
        → Talk2Data: Excel → pandas → Parquet на диск
        → response: {file_id, filename, row_count, columns}
  └─ file_id вставляется в системный контекст разговора
  └─ Вопрос пользователя → POST /v1/chat/completions
  └─ LLM (QWEN) видит file_id → вызывает excel-инструменты
  └─ Инструменты → pd.read_parquet() → данные
  └─ Рендер: Markdown-таблицы + Plotly-графики (как FTE)
```

---

## Структура модулей

```
app/
├── excel_br/
│   ├── __init__.py
│   ├── source.py        ← DataSource протокол (Excel now, DB later)
│   ├── parser.py        ← parse_excel() → Parquet; registry {file_id → path}
│   ├── queries.py       ← pandas-функции: info, aggregate, time_series
│   ├── tools.py         ← EXCEL_TOOLS (OpenAI schema) + dispatch_tool()
│   └── render.py        ← Markdown + Plotly → HTML chart (как FTE render.py)
└── api/
    └── excel_endpoints.py  ← POST /excel/upload

/tmp/t2d_excel/
    └── {file_id}.parquet   ← хранилище на диск, TTL 4 часа (cron cleanup)
```

### DataSource протокол (`source.py`)

```python
from typing import Protocol
import pandas as pd

class DataSource(Protocol):
    def get_df(self, file_id: str, columns: list[str] | None = None) -> pd.DataFrame:
        ...
```

Две реализации:
- `ParquetSource` — читает `/tmp/t2d_excel/{file_id}.parquet`
- `DatabaseSource` — (будущее) читает из SQL по `file_id` как идентификатор датасета

Инструменты (`queries.py`, `tools.py`) работают только через `DataSource` — источник данных подменяется без изменений в инструментах.

---

## Upload endpoint

```
POST /excel/upload
Content-Type: multipart/form-data

file: <binary Excel>
```

**Обработка:**
1. Принять файл через `UploadFile` (FastAPI)
2. `pd.read_excel(file, engine='openpyxl')` — первый лист или указанный
3. Сохранить как `Parquet` в `/tmp/t2d_excel/{file_id}.parquet` (snappy compression)
4. Зарегистрировать `file_id → path` в in-memory registry
5. Вернуть:

```json
{
  "file_id": "a1b2c3d4",
  "filename": "S_and_M_X5.xlsx",
  "row_count": 32304,
  "column_count": 135,
  "columns": ["Статус", "Тип услуги", "GDS", ...],
  "date_range": {"min": "2024-01-01", "max": "2024-12-31"},
  "size_mb": 17.2
}
```

**Лимиты:** FastAPI `max_upload_size` = 50 МБ (через `--limit-max-request-body-size`).  
**Ошибки:** 400 если не xlsx/xls, 413 если > 50 МБ, 422 если файл не читается.

---

## LLM-инструменты (Сценарий 1: свободный чат)

### `excel_info(file_id)`

Первый вызов LLM после получения `file_id`. Возвращает структуру файла:
- Количество строк и колонок
- Список колонок с типами данных
- Диапазон дат (если есть дата-колонки)
- Числовые диапазоны ключевых полей (min, max, sum для числовых)
- Топ-5 уникальных значений для категориальных колонок (≤ 50 уникальных)

### `excel_aggregate(file_id, groupby, metric, agg, filters?, top_n?)`

Параметры:
- `groupby` — список колонок для группировки (напр. `["Тип услуги"]`)
- `metric` — колонка для агрегации (напр. `"Сумма"`)
- `agg` — функция: `sum | count | mean | median | nunique`
- `filters` — опционально: `[{"col": "GDS", "op": "eq", "val": "Sabre"}]`
- `top_n` — опционально: вернуть топ N строк по метрике

Покрывает: "ТОП-10 направлений по spend", "Доля авиа vs ж/д", "Расходы по подразделениям", "Сколько транзакций".

### `excel_time_series(file_id, date_col, metric_col, freq, filters?)`

Параметры:
- `date_col` — колонка с датой
- `metric_col` — метрика (`count` или название числовой колонки)
- `freq` — `month | week | quarter | year`
- `filters` — опционально

Покрывает: "Динамика по месяцам", "Рост spend в Q4", "Сезонность".

---

## Рендер

Следует паттерну `app/fte/render.py`:
- `render_excel_aggregate()` → Markdown-таблица + Plotly bar/pie chart
- `render_excel_time_series()` → Plotly line chart
- `render_excel_info()` → структурированный Markdown без графика

LLM выбирает `chart_type` в аргументах: `bar | line | pie | heatmap`.  
HTML-графики сохраняются в `/tmp/t2d_charts/` и отдаются через `/charts/{id}.html` (существующий механизм FTE).

---

## OWUI Native Tool — конфигурация

В Admin Panel → Tools → Add Tool (OpenAPI JSON):

```json
{
  "openapi": "3.1.0",
  "info": {"title": "Talk2Data Excel Upload", "version": "1.0"},
  "servers": [{"url": "http://talk2data:8000"}],
  "paths": {
    "/excel/upload": {
      "post": {
        "operationId": "upload_excel",
        "summary": "Загрузить Excel-файл для анализа данных",
        "requestBody": {
          "content": {
            "multipart/form-data": {
              "schema": {
                "type": "object",
                "properties": {
                  "file": {"type": "string", "format": "binary"}
                },
                "required": ["file"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "file_id и метаданные файла"
          }
        }
      }
    }
  }
}
```

После загрузки OWUI инжектирует `file_id` в системный промпт следующего сообщения.

---

## Интеграция в pipeline

В `app/api/openai_compat.py`:

```python
from app.excel_br.tools import EXCEL_TOOLS, dispatch_tool as excel_dispatch

# В _get_tools():
def _get_tools(god_mode: bool, has_excel: bool = False) -> list[dict]:
    tools = FTE_TOOLS + ([TOOL_EXECUTE_SQL] if god_mode else [])
    if has_excel:
        tools += EXCEL_TOOLS
    return tools
```

`has_excel` определяется по наличию `file_id` в последних сообщениях.

---

## Системный промпт

Дополнение к `prompts/fte.md` — новый файл `prompts/excel_br.md`:

```markdown
# Excel BR режим

Пользователь загрузил файл данных. file_id: {file_id}

Начни с вызова excel_info чтобы понять структуру данных.
Затем отвечай на вопросы используя excel_aggregate и excel_time_series.
Выбирай chart_type исходя из данных: bar для рейтингов, line для трендов, pie для долей.
```

---

## Что НЕ входит в Sprint 1

- Генерация Business Review и презентаций (Sprint 2+)
- Шаблонные BR (Sprint 3)
- Интервью и каталог вопросов (Sprint 4)
- Поддержка нескольких листов Excel одновременно
- Persistence кэша между рестартами сервиса
- Подключение к БД как источнику данных

---

## Тесты

- `tests/test_excel_upload.py` — загрузка файла, проверка Parquet, ошибки (неверный формат, > лимит)
- `tests/test_excel_queries.py` — `excel_aggregate`, `excel_time_series`, `excel_info` с тестовым Parquet
- `tests/test_excel_tools.py` — `dispatch_tool()`, OpenAI schema валидация
- Coverage порог: 95% (как в остальных тестах)
