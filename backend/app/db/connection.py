"""Подключение к MS SQL Server (TalkToData) через pyodbc.

Соединение создаётся per-request (без pooling). Read-only — пользователь
talktodata имеет только роль db_datareader, но дополнительно ограничиваем
только SELECT запросы на уровне приложения.
"""

import logging
import time
from contextlib import contextmanager
from typing import Generator

import pandas as pd
import pyodbc

from app.core.config import settings

_logger = logging.getLogger("t2d_br.db")
_logger.setLevel(logging.INFO)
if not _logger.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("[%(asctime)s] %(message)s", datefmt="%H:%M:%S"))
    _logger.addHandler(_h)
    _logger.propagate = False


def _conn_kwargs() -> dict:
    """Keyword-аргументы для pyodbc.connect."""
    s = settings
    return {
        "driver":                 s.mssql_driver,
        "server":                 f"{s.mssql_server},{s.mssql_port}",
        "database":               s.mssql_database,
        "uid":                    s.mssql_user,
        "pwd":                    s.mssql_password,
        "TrustServerCertificate": "yes",
        "Encrypt":                "no",
    }


@contextmanager
def get_connection(timeout: int = 15) -> Generator[pyodbc.Connection, None, None]:
    """Context manager для pyodbc-соединения."""
    conn = pyodbc.connect(**_conn_kwargs(), timeout=timeout)
    try:
        yield conn
    finally:
        conn.close()


def query_df(sql: str, params: tuple = (), query_timeout: int = 30) -> pd.DataFrame:
    """Выполняет SQL и возвращает DataFrame.

    Args:
        sql: SQL-запрос с плейсхолдерами '?' для SQL Server.
        params: кортеж параметров.
        query_timeout: таймаут выполнения в секундах.
    """
    t = time.monotonic()
    with get_connection() as conn:
        conn.timeout = query_timeout
        cursor = conn.cursor()
        cursor.execute(sql, params)
        if cursor.description is None:
            return pd.DataFrame()
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        # pyodbc.Row -> tuple
        df = pd.DataFrame.from_records([tuple(r) for r in rows], columns=columns)
    dt = time.monotonic() - t
    _logger.info(f"sql ok in {dt:.2f}s rows={len(df)} sql={sql[:120].strip()!r}")
    return df
