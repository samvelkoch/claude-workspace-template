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
