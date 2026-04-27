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

    freq_map = {"month": "M", "week": "W", "quarter": "Q", "year": "Y"}
    pd_freq = freq_map.get(freq, "M")

    if metric_col == "count":
        result = df.resample(pd_freq, on=date_col).size().reset_index(name="count")
    else:
        result = df.resample(pd_freq, on=date_col)[metric_col].sum().reset_index()

    result[date_col] = result[date_col].dt.strftime("%Y-%m-%d")
    return result
