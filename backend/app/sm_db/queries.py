"""SQL-запросы к TalkToData. Только SELECT, с TOP-лимитом по умолчанию."""

import re
from typing import Any

import pandas as pd

from app.db.connection import query_df

_MAX_ROWS_DEFAULT = 1000
_QUERY_TIMEOUT = 30

_SELECT_RE = re.compile(r"^\s*select\s+", re.IGNORECASE)
_HAS_TOP_RE = re.compile(r"^\s*select\s+top\s+\d+", re.IGNORECASE)


def _strip_trailing_semicolons(sql: str) -> str:
    return sql.strip().rstrip(";").strip()


def _ensure_top(sql: str, max_rows: int) -> str:
    """Добавляет TOP {max_rows} в начало SELECT, если его там нет."""
    if _HAS_TOP_RE.match(sql):
        return sql
    return _SELECT_RE.sub(f"SELECT TOP {max_rows} ", sql, count=1)


def _is_safe_select(sql: str) -> bool:
    """Проверяет, что запрос — это SELECT (не DML/DDL).

    Простой защитный слой поверх read-only роли: не пускаем INSERT/UPDATE/
    DELETE/DROP/EXEC и многократные statements.
    """
    s = _strip_trailing_semicolons(sql)
    if ";" in s:
        # multi-statement disallowed
        return False
    if not _SELECT_RE.match(s):
        return False
    # Запрещаем явно опасные ключевые слова на верхнем уровне
    forbidden = re.compile(
        r"\b(insert|update|delete|drop|alter|create|exec|execute|truncate|merge|grant|revoke)\b",
        re.IGNORECASE,
    )
    return forbidden.search(s) is None


def execute_select(sql: str, max_rows: int = _MAX_ROWS_DEFAULT) -> pd.DataFrame:
    """Выполняет SELECT, возвращает DataFrame.

    Поднимает ValueError если SQL не SELECT или содержит запрещённые операции.
    Автоматически добавляет `TOP {max_rows}` если он отсутствует.
    """
    sql = _strip_trailing_semicolons(sql)
    if not _is_safe_select(sql):
        raise ValueError("Только одиночный SELECT-запрос разрешён")
    sql = _ensure_top(sql, max_rows)
    return query_df(sql, params=(), query_timeout=_QUERY_TIMEOUT)


# --- Identifier sanitizers (для фиксированных шаблонных запросов) ---
_IDENT_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_ \,\(\)\.\-]*$")


def _sanitize_table(name: str) -> str:
    """Разрешает 'dbo.DataTable' и подобное; иначе ValueError."""
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*", name):
        raise ValueError(f"Недопустимое имя таблицы: {name!r}")
    return name


def _sanitize_column(name: str) -> str:
    """Разрешает имена с пробелами/запятыми/скобками. Будет обёрнуто в []."""
    if not _IDENT_RE.match(name):
        raise ValueError(f"Недопустимое имя колонки: {name!r}")
    return f"[{name}]"


def get_distinct_values(
    column: str,
    table: str = "dbo.DataTable",
    limit: int = 100,
) -> list[str]:
    """Топ-N уникальных значений колонки. Полезно для discovery."""
    tbl = _sanitize_table(table)
    col = _sanitize_column(column)
    sql = (
        f"SELECT TOP {int(limit)} {col} AS val, COUNT(*) AS cnt "
        f"FROM {tbl} WHERE {col} IS NOT NULL "
        f"GROUP BY {col} ORDER BY cnt DESC"
    )
    df = query_df(sql, params=(), query_timeout=_QUERY_TIMEOUT)
    if df.empty:
        return []
    return [None if pd.isna(v) else str(v) for v in df["val"].tolist()]


def get_custom_property_names() -> list[str]:
    """Список всех уникальных DataName в DataCustomPropertyTable."""
    sql = (
        "SELECT DataName, COUNT(*) AS cnt "
        "FROM dbo.DataCustomPropertyTable "
        "GROUP BY DataName ORDER BY cnt DESC"
    )
    df = query_df(sql, params=(), query_timeout=_QUERY_TIMEOUT)
    if df.empty:
        return []
    return [str(v) for v in df["DataName"].tolist()]
