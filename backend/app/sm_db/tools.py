"""OpenAI tool definitions для SM database (TalkToData) и dispatcher."""

from typing import Any

from app.sm_db.queries import (
    execute_select,
    get_custom_property_names,
    get_distinct_values,
)

SM_TOOLS: list[dict] = [
    {
        "type": "function",
        "function": {
            "name": "sm_query",
            "description": (
                "Выполнить SELECT-запрос к базе TalkToData (MS SQL Server, T-SQL диалект). "
                "Колонки с пробелами обрамлять в []. Числовые varchar поля приводить через "
                "TRY_CAST(... AS decimal(18,2)). Возвращает первые до 1000 строк "
                "(TOP 1000 добавляется автоматически если не указан). Только одиночный SELECT, "
                "DML/DDL запрещены."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "sql": {
                        "type": "string",
                        "description": "Одиночный SELECT-запрос на T-SQL.",
                    },
                },
                "required": ["sql"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "sm_distinct_values",
            "description": (
                "Получить уникальные значения колонки с количеством. Полезно для discovery: "
                "какие Status, Type Of Service, Company name бывают в данных."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "column": {
                        "type": "string",
                        "description": "Имя колонки (без квадратных скобок).",
                    },
                    "table": {
                        "type": "string",
                        "description": "Имя таблицы (по умолчанию dbo.DataTable).",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Сколько уникальных значений вернуть (default 100).",
                    },
                },
                "required": ["column"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "sm_custom_properties",
            "description": (
                "Список всех имён кастомных свойств в DataCustomPropertyTable (EAV). "
                "Используй чтобы понять какие атрибуты доступны для JOIN-а."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
            },
        },
    },
]


def dispatch_tool(name: str, args: dict[str, Any]) -> Any:
    """Вызывает SM-функцию по имени инструмента."""
    if name == "sm_query":
        return execute_select(args["sql"], max_rows=int(args.get("max_rows", 1000)))
    if name == "sm_distinct_values":
        return get_distinct_values(
            column=args["column"],
            table=args.get("table", "dbo.DataTable"),
            limit=int(args.get("limit", 100)),
        )
    if name == "sm_custom_properties":
        return get_custom_property_names()
    raise ValueError(f"Unknown SM tool: {name!r}")
