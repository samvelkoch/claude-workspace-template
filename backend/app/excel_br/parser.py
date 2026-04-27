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
    # Привести смешанные object-колонки к строке — иначе pyarrow падает на Parquet
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str)

    file_id = uuid.uuid4().hex[:8]
    parquet_path = _EXCEL_DIR / f"{file_id}.parquet"
    df.to_parquet(parquet_path, index=False, compression="snappy")

    date_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()
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
