"""Форматирование результатов SM-инструментов: Markdown + опциональный Plotly."""

import uuid
from pathlib import Path
from typing import Any

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

from app.core.config import settings

_CHARTS_DIR = Path(settings.charts_dir)
_CHARTS_DIR.mkdir(parents=True, exist_ok=True)

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


def _df_to_markdown(df: pd.DataFrame, max_rows: int = 50) -> str:
    if len(df) > max_rows:
        head = df.head(max_rows)
        return head.to_markdown(index=False) + f"\n\n_Показано {max_rows} из {len(df)} строк._"
    return df.to_markdown(index=False)


def render_sm_query(df: pd.DataFrame, args: dict, public_url: str) -> tuple[str, str]:
    """Markdown-таблица + опциональный bar-chart если структура подходит."""
    if df is None or (isinstance(df, pd.DataFrame) and df.empty):
        return "_Запрос вернул 0 строк._", "Запрос: 0 строк."

    md_table = _df_to_markdown(df)

    # Генерим chart если ровно одна метрика и <= 50 строк
    numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    content = md_table
    chart_made = False
    if 1 <= len(numeric_cols) <= 3 and 1 < len(df) <= 50 and len(df.columns) >= 2:
        try:
            metric_col = numeric_cols[-1]
            non_metric = [c for c in df.columns if c != metric_col]
            if non_metric:
                df_chart = df.copy()
                if len(non_metric) == 1:
                    label_col = non_metric[0]
                else:
                    df_chart["_label"] = df_chart[non_metric].astype(str).apply(
                        lambda r: " / ".join(r.values), axis=1
                    )
                    label_col = "_label"
                # bar horizontal — лучше читается длинные подписи
                fig = px.bar(
                    df_chart,
                    x=metric_col,
                    y=label_col,
                    orientation="h",
                    template=_PLOTLY_TEMPLATE,
                    color_discrete_sequence=_BAR_COLORS,
                )
                fig.update_layout(yaxis={"categoryorder": "total ascending"})
                name = uuid.uuid4().hex
                _save_html(fig, name)
                content = md_table + _chart_link(name, public_url)
                chart_made = True
        except Exception:
            # график — best effort, не падаем
            chart_made = False

    summary = f"SQL: {len(df)} строк, {len(df.columns)} колонок." + (
        " График сгенерирован." if chart_made else ""
    )
    return content, summary


def render_sm_distinct_values(values: list, args: dict, _: str) -> tuple[str, str]:
    """Markdown-список значений."""
    column = args.get("column", "?")
    table = args.get("table", "dbo.DataTable")
    if not values:
        return f"_Колонка `{column}` ({table}): значений не найдено._", "0 значений."
    lines = [f"**Уникальные значения `{column}` в `{table}`** ({len(values)}):", ""]
    for v in values:
        if v is None:
            lines.append("- _NULL_")
        else:
            lines.append(f"- `{v}`")
    return "\n".join(lines), f"distinct {column}: {len(values)} значений."


def render_sm_custom_properties(names: list, args: dict, _: str) -> tuple[str, str]:
    """Markdown-список DataName."""
    if not names:
        return "_Кастомных свойств не найдено._", "0 свойств."
    lines = [f"**DataName в DataCustomPropertyTable** ({len(names)}):", ""]
    for n in names:
        lines.append(f"- `{n}`")
    return "\n".join(lines), f"custom properties: {len(names)}."
