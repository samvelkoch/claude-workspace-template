# Прогресс: Business Review React App

## Handoff
- Ход: `local`
- Коммит: feat: implement React frontend from Claude Design handoff
- В процессе: —

## Статус
Frontend реализован по дизайн-файлу из Claude Design handoff (`context/handoff/`).
Сборка чистая: `npm run build` — 0 TypeScript ошибок.
Следующий шаг: backend FastAPI (Sprint 1), интеграция с реальным API.

## Следующий шаг
1. `cd frontend && npm run dev` — запустить dev-сервер, проверить UI
2. Реализовать backend (FastAPI) по плану `docs/superpowers/plans/2026-04-25-excel-br-sprint1.md`
3. Подключить реальный API: `VITE_API_URL=http://localhost:8000` в `.env.local`
4. Тестировать с реальным Excel-файлом

## Сделано
- [2026-04-26] Создан проект из template
- [2026-04-26] Перенесены спецификации BR из owui-проекта
- [2026-04-26] CLAUDE.md и PROGRESS.md адаптированы под веб-проект
- [2026-04-26] Получен и распакован Claude Design handoff (`context/handoff/`)
- [2026-04-26] **Реализован полный React frontend по дизайну:**
  - Vite + React + TypeScript + Tailwind (v3) scaffold
  - Design system из дизайна: CSS custom properties, шрифты Inter Tight + JetBrains Mono
  - Компоненты: Icon, Avatar, Message, FileChip, ChatShell, ToolCallBadge, DataTable, FakeBars, FakeLine
  - Views: UploadView, EntryView (3 сценария), FreeChatView, TemplateView, InterviewView, CatalogView, PresentationView
  - App — state machine: upload → entry → free_chat/template → interview → catalog → presentation
  - Demo mode (работает без бэкенда): mock данные + mock chart responses
  - Брендинг: Аэроклуб AI | talk2data | Business Review Studio + SVG логотип

## Структура frontend/
```
frontend/
├── index.html         — заголовок, шрифты Google Fonts
├── src/
│   ├── index.css      — design system (CSS vars, .chat-*, .msg, .btn, .chip, .card, .plot, ...)
│   ├── types/index.ts — Phase, FileInfo, ChatMessage, IconName
│   ├── components/    — Icon, Avatar, Message, FileChip, ChatShell, ToolCallBadge, DataTable, FakeBars, FakeLine
│   ├── views/         — UploadView, EntryView, FreeChatView, TemplateView, InterviewView, CatalogView, PresentationView
│   └── App.tsx        — state machine + API calls + demo mode fallback
```

## Контекст
- Исходный проект: `../services-ai-talk2data-owui/`
- Дизайн: `context/handoff/t2d-business-review/project/Talk2Data BR.html`
- Backend план: `docs/superpowers/plans/2026-04-25-excel-br-sprint1.md`
- API URL: `VITE_API_URL=http://localhost:8000` (дефолт)

## Открытые вопросы
- Backend: где будет деплоиться? Порт, Docker?
- Аутентификация: нужна ли на первом этапе?
- Реальные Plotly-графики: заменить FakeBars/FakeLine на iframe из бэкенда?

## Dead ends
<!-- пусто -->
