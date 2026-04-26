# Проект: Business Review React App

## Старт сессии (читать первым делом)

1. `git pull` — синхронизироваться перед любой работой
2. Прочитать `PROGRESS.md` — статус, что сделано, следующий шаг
3. Проверить `## Handoff` → поле "Ход": если не твой тег — уточнить перед стартом
4. Если есть `context/` — прочитать релевантные файлы
5. Уточнить цель сессии если неясно

---

## Цель

Кастомный React-продукт для Business Review — аналитический дашборд с AI-ассистентом поверх Talk2Data. Без OWUI, без готовых AI-чат-оболочек. Собственный UX.

Исходные спецификации: `docs/superpowers/specs/`, планы: `docs/superpowers/plans/`.

---

## Стек

**Frontend:** React + TypeScript + Vite + Tailwind CSS  
**Backend:** FastAPI (Python)  
**AI:** Claude API (через существующий Talk2Data бэкенд или напрямую)  
**DB:** SQL Server (mow2bi2) через `db_mow2bi2.py`  

---

## Структура проекта

```
frontend/        — React приложение (Vite + TS)
backend/         — FastAPI сервис
docs/
  superpowers/
    specs/       — спецификации (перенесены из owui-проекта)
    plans/       — планы реализации
context/         — схемы данных, глоссарий
```

---

## Правила

- Никаких loops на больших данных — только векторизованные операции
- Credentials только через `.env`, никогда inline
- Никаких cross-server JOIN в SQL — два запроса, соединять в Python
- Один коммит = одна логическая единица работы

---

## Дисциплина коммитов

- Формат: `[feat|fix|refactor|style|docs] краткое описание`
- Handoff-коммит: `handoff: SERVER→LOCAL — [что сделано, что дальше]`

---

## Связь со старым проектом

Спецификации и контекст Business Review из `services-ai-talk2data-owui/docs/`:
- Спек BR Sprint 1: `docs/superpowers/specs/2026-04-25-excel-br-sprint1-design.md`
- План BR Sprint 1: `docs/superpowers/plans/2026-04-25-excel-br-sprint1.md`
