"""Форматирование результатов Excel-инструментов: Markdown + Plotly HTML."""

import uuid
from pathlib import Path

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


def render_excel_info(info: dict, args: dict, public_url: str) -> tuple[str, str]:
    """Markdown-описание структуры файла."""
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
    """Markdown-таблица + Plotly bar/pie + ссылка."""
    metric_col = df.columns[-1]
    chart_type = args.get("chart_type", "auto")
    n_rows = len(df)
    name = uuid.uuid4().hex

    if chart_type == "pie" or (chart_type == "auto" and n_rows <= 6):
        label_col = df.columns[0]
        fig = px.pie(df, values=metric_col, names=label_col,
                     template=_PLOTLY_TEMPLATE, color_discrete_sequence=_BAR_COLORS)
    else:
        if len(df.columns) == 2:
            fig = px.bar(df, x=metric_col, y=df.columns[0], orientation="h",
                         template=_PLOTLY_TEMPLATE, color_discrete_sequence=_BAR_COLORS)
        else:
            df = df.copy()
            df["_label"] = df[df.columns[:-1]].apply(
                lambda r: " / ".join(str(v) for v in r), axis=1
            )
            fig = px.bar(df, x=metric_col, y="_label", orientation="h",
                         template=_PLOTLY_TEMPLATE, color_discrete_sequence=_BAR_COLORS)

    _save_html(fig, name)
    md_table = df.to_markdown(index=False)
    content = md_table + _chart_link(name, public_url)
    top_val = df[metric_col].iloc[0]
    summary = f"Агрегация: {n_rows} групп, топ значение {top_val:,.0f}."
    return content, summary


def render_excel_time_series(df: pd.DataFrame, args: dict, public_url: str) -> tuple[str, str]:
    """Markdown-таблица + Plotly line + ссылка."""
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
