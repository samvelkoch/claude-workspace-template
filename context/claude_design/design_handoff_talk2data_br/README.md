# Handoff: Talk2Data BR — Open WebUI Tool

## Overview

Аналитический ассистент поверх **Open WebUI (OWUI)**: пользователь работает в стандартном чате OWUI, прикрепляет Excel (корп-тревел S&M, 30K+ строк × 100+ колонок), задаёт вопросы свободным текстом или собирает Business Review в одном из трёх режимов. Backend — FastAPI tool, оркестратор — QWEN через локальный LLM-прокси.

**Никакого кастомного фронтенда нет и не планируется.** Всё взаимодействие — Markdown в чате OWUI + Rich UI embeds (HTMLResponse iframe) для графиков и презентаций.

## About the Design Files

Файлы в этой папке — **design references**, HTML-прототипы, показывающие как должны выглядеть и вести себя сообщения tool-а внутри OWUI. Это **НЕ продакшн-код** и **НЕ замена** OWUI. Задача — реализовать поведение в виде **FastAPI / Open WebUI Tool**, который возвращает Markdown + опционально Rich UI HTMLResponse, а UI остаётся стандартный OWUI.

## Fidelity

**Low-fidelity wireframes** (sketch-стиль, моноширинный/handwritten шрифт). Структура, копирайт и логика взаимодействия — финальные. Типографика и цвета OWUI — берутся из самого OWUI (light/dark theme по настройкам пользователя). Не нужно копировать sketch-эстетику в production — она использована только чтобы подчеркнуть «это мокап».

## Финальные решения по сценариям

После исследования вариантов выбраны следующие финалисты (см. `wireframes_v03_finalists.html`):

| Сцена | Решение |
|---|---|
| **01 · Onboarding / first upload** | Pure Markdown приветствие → ждём прикреплённый xlsx → `event_emitter` статусы парсинга → Markdown summary-таблица + numbered меню «1/2/3» (1a) |
| **02 · Резюм с тем же файлом** | После повторного открытия чата — короткое summary что в файле + три кнопки `event_call confirmation` (Продолжить / Заменить / +Добавить) |
| **03 · Выбор сценария BR** | **Гибрид 3a + 3d:** Markdown-меню с описанием трёх режимов (1/2/3) + ниже три primary-кнопки `event_call confirmation` (▦ Шаблон / ? Интервью / ☑ Каталог). Free-text всегда работает. |
| **04 · Шаблонный BR (2.1)** | **4b:** Markdown-таблица сравнения трёх шаблонов (Exec / Operational / Client) с колонками «Слайдов / Аудитория / Глубина / Графиков» + три primary-кнопки. |
| **05 · Интервью BR (2.2)** | **5c (адаптивное):** LLM сама решает сколько вопросов задать на основе ответа на первый. Каждый вопрос — bot-сообщение с короткими подсказками-кнопками + всегда free-text fallback. |
| **06 · Каталог вопросов (2.3)** | **6b + 6d:** Numbered list с диапазонами как primary-режим («1, 3, 7-9»). Опционально — Rich UI iframe с интерактивным деревом (для админов которые включили Rich UI embeds). |
| **07 · Презентация — финальная ссылка** | **7a + 7c + 7d:** Rich UI карточка с превью первого слайда + кнопки Открыть/PDF/PPTX. Plain-Markdown TOC со списком слайдов как fallback / альтернатива. |
| **08 · Edge cases** | **8a (битый файл):** callout с диагностикой и кнопкой «попробовать ещё». **8c (большой файл):** обрабатываем первые 100K строк сразу, полный пересчёт в фоне. Везде free-text fallback. |

**Ключевой принцип:** Кнопки — ускоритель, не клетка. Везде где есть кнопки, под ними подпись «или напишите своими словами». LLM матчит произвольный ответ к ближайшей опции, или вызывает другой tool, или продолжает диалог. Кнопки **никогда** не блокируют ввод.

## OWUI Capabilities Used

Опираемся на:

- **Plain Markdown** — таблицы, заголовки, списки, ссылки, code-blocks. Базовый уровень.
- **`__event_emitter__`** — статусы выполнения (`type: "status"`). Пишутся в БД, переживают reload. Используются для прогресса парсинга, агрегации, рендера презентации.
- **`__event_call__`** — интерактивные элементы:
  - `type: "confirmation"` — кнопки выбора (сцены 02, 03, 04, 05). Возвращает `{value: "..."}`.
  - `type: "input"` — модальная форма (опционально для интервью 5b, не выбран в финалистах).
- **Rich UI embeds (HTMLResponse)** — `Content-Disposition: inline`. Возвращаем HTML — OWUI рендерит в iframe. Используется для:
  - Plotly-графиков в чате (сцена 02)
  - Превью презентации (сцена 07)
  - Интерактивного дерева вопросов (сцена 06, опционально)
- **Action functions** — alias для tool-а с inline-кнопкой; полезны для «Доработать слайд», «Выгрузить CSV» в сцене 02.

> Требование: для интерактивных Rich UI embeds админ OWUI должен включить **Iframe Same-Origin = ON**. Если выключено — Markdown-fallback во всех сценах работает без потерь функциональности.

## Архитектура tool-ов (FastAPI)

Предлагаемая структура — один OWUI Tool-плагин с шестью функциями:

```python
class Tools:
    async def parse_excel(file_id, __event_emitter__): ...
    async def ask(question, __event_emitter__): ...                 # сцена 02
    async def start_br(__event_call__, __event_emitter__): ...      # сцена 03
    async def br_template(template_id, __event_emitter__): ...      # сцена 04
    async def br_interview(__event_call__, __event_emitter__): ...  # сцена 05
    async def br_catalog(selection, __event_emitter__): ...         # сцена 06
    async def render_presentation(br_spec, __event_emitter__): ...  # сцена 07
```

Каждая функция:
1. Шлёт `event_emitter type:"status"` пока работает.
2. Возвращает Markdown-строку (тело bot-сообщения).
3. Опционально вызывает `event_call` для inline-кнопок и блокирующего ожидания ответа юзера.
4. Опционально возвращает дополнительный HTMLResponse для Rich UI embed (графики, превью).

## Контракт каждой сцены

### 03 · start_br

**Возврат:** Markdown с описанием 3 режимов + `event_call confirmation` с options:
```python
event_call({
    "type": "confirmation",
    "data": {
        "title": "Режим Business Review",
        "options": [
            {"value": "template",  "label": "▦ Шаблон"},
            {"value": "interview", "label": "? Интервью"},
            {"value": "catalog",   "label": "☑ Каталог"},
        ]
    }
})
```
**Free-text path:** если юзер игнорит кнопки и пишет «второй» / «соберу под себя» / «у меня свои вопросы» — system prompt инструктирует LLM мапить в `template`/`interview`/`catalog` и звать соответствующий tool напрямую.

### 04 · br_template

Возвращает Markdown-таблицу сравнения + три кнопки. После выбора:
1. `event_emitter status: "Считаю агрегаты по 7 разрезам"`
2. `event_emitter status: "Строю 3 графика Plotly"`
3. `event_emitter status: "Собираю Marp презентацию"`
4. Возвращает «✓ Готово» + карточка из сцены 07.

### 05 · br_interview

Адаптивное. Вместо фиксированных 4 вопросов — LLM решает по ответу. Базовый flow:
- Вопрос 1: «Для кого готовим?» — кнопки `[C-level] [тревел-менеджер] [клиент]`
- Если C-level → один вопрос «что главное в этом квартале» → собрать и закончить.
- Если тревел-менеджер → два-три уточнения по операционке.
- Если клиент → формат презентации, акцент на saving.

### 06 · br_catalog

Markdown numbered list (32 пункта по 3 категориям). Парсер ответа поддерживает:
- одиночные номера: `5`
- список: `1, 3, 5`
- диапазоны: `7-9`, `1-4`
- категории: `все из расходов`, `все из провайдеров + 8`

Rich UI fallback (опционально): дерево с чекбоксами в iframe, постит выбор через `window.parent.postMessage`.

### 07 · render_presentation

1. Backend генерирует Marp Markdown из выбранных слайдов.
2. Marp CLI → HTML на `/presentations/{id}.html`.
3. Backend рендерит первый слайд в PNG (headless Chrome / Marp `--images png`) на `/presentations/{id}/slide1.png`.
4. Tool возвращает HTMLResponse с превью-карточкой:

```html
<div style="border:1px solid #2a2a2e; border-radius:8px; overflow:hidden; max-width:520px">
  <img src="/presentations/{id}/slide1.png" style="width:100%; display:block">
  <div style="padding:10px 14px; display:flex; justify-content:space-between">
    <div>
      <div><b>Q1 2026 · Operational Review</b></div>
      <div style="color:#999; font-size:11px">13 слайдов · 8 графиков</div>
    </div>
    <div>
      <a href="/presentations/{id}.html" target="_blank">Открыть</a>
      <a href="/presentations/{id}.pdf">PDF</a>
      <a href="/presentations/{id}.pptx">PPTX</a>
    </div>
  </div>
</div>
```

## Visual / Copy Tokens

- **Tone:** дружелюбный, но без emoji. Профессиональный аналитик, не «AI ассистент».
- **Язык:** русский. Цифры — пробел разделитель тысяч (`14 820 410`).
- **Валюта:** ₽, после числа.
- **Даты:** ISO формат в технических местах (`2026-01-12`), русский в копирайте («Q1 2026», «01.01–31.03»).
- **Категории данных:** Авиа, ж/д, отели, трансферы.
- **Шаблоны BR (фиксированные id):** `executive_summary`, `operational_review`, `client_presentation`.

## State / Context

OWUI хранит chat history в БД. Tool **не держит** свой state — на каждый вызов восстанавливает контекст из:
- прикреплённый xlsx file_id (доступ через OWUI files API),
- distilled summary в первом сообщении (то что сцена 01 положила),
- история выборов юзера (parsing prior `event_call` results из messages).

Будущая интеграция с DWH (SQL Server) — Excel станет fallback, основной путь — connection_id + SQL queries вместо xlsx-парсинга.

## Performance budget

- Парсинг 30K строк × 100 колонок: цель **< 5 сек**, делать через polars / duckdb.
- Файлы > 30 MB или > 500K строк: streaming с превью на 100K строк за < 10 сек, полный пересчёт в фоне.
- Plotly chart rendering: < 1 сек на чарт.
- Marp presentation: < 15 сек на 13 слайдов.

## Files in this bundle

- `wireframes_v03_finalists.html` — **основной reference**, выбранные finalists по всем сценам с пометками-аннотациями и API-контрактом для каждого блока.
- `wireframes_v01_explore.html` — расширенное исследование: по 4 варианта подачи каждого экрана (numbered list / table / ASCII card / inline buttons / Rich UI). Полезно если захочется альтернативу или fallback.

## Quick start для разработчика

1. Поднять локальный Open WebUI (docker, `ghcr.io/open-webui/open-webui:main`).
2. В Workspace → Tools создать новый tool, вставить scaffold с шестью функциями.
3. Реализовать `parse_excel` первым — это разблокирует остальное (можно мокать данные).
4. Имплементировать `ask` (свободный чат) — самостоятельная ценность, можно зарелизить отдельно.
5. Сценарии BR (`start_br`, `br_template`, `br_interview`, `br_catalog`) — в порядке возрастания сложности.
6. `render_presentation` — последним, требует Marp CLI и headless Chrome для превью.

## Open questions для product

- DWH connection: какой драйвер (`pyodbc` / `pymssql`), как храним credentials?
- Нужно ли cache-ить распарсенные xlsx (Redis? сами файлы в OWUI files уже хранятся)?
- Какой timeout на Plotly render для очень больших чартов?
- PDF / PPTX экспорт — server-side (Marp CLI) или client-side (browser print)?
