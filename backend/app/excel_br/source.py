"""DataSource протокол + ParquetSource реализация."""

import re
from pathlib import Path
from typing import Protocol

import pandas as pd


class DataSource(Protocol):
    def get_df(self, file_id: str, columns: list[str] | None = None) -> pd.DataFrame: ...


class ParquetSource:
    _EXCEL_DIR: Path = Path("/tmp/t2d_excel")

    def get_df(self, file_id: str, columns: list[str] | None = None) -> pd.DataFrame:
        if not re.fullmatch(r"[a-f0-9]{8}", file_id):
            raise ValueError(f"Invalid file_id: {file_id!r}")
        path = self._EXCEL_DIR / f"{file_id}.parquet"
        if not path.exists():
            raise FileNotFoundError(f"file_id={file_id!r} не найден в {self._EXCEL_DIR}")
        return pd.read_parquet(path, columns=columns)


_default_source = ParquetSource()


def get_source() -> ParquetSource:
    return _default_source
