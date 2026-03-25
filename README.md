# claude-workspace template

Шаблон для новых research-проектов. Копировать при старте каждого нового проекта.

## Использование

```bash
cp -r template/ my-new-project/
cd my-new-project/
git init
# заполнить плейсхолдеры в CLAUDE.md и PROGRESS.md
```

## Структура

```
project/
├── CLAUDE.md           ← протокол работы для Claude в этом проекте
├── PROGRESS.md         ← главный файл синхронизации между сессиями и агентами
├── .claudeignore       ← данные и секреты исключены из контекста
├── context/
│   └── data_schema.md  ← создаётся и обновляется по мере изучения данных
├── data/
│   └── sample/         ← только сэмплы, никогда не raw
├── notebooks/
└── src/
```

## Что нужно на новой машине

**Claude Code глобальные настройки** (`~/.claude/`):
- `settings.json` — разрешения, модель, хуки
- `commands/` — кастомные скиллы (confluence и др.)
- `plugins/` — superpowers и другие плагины

**Токены и подключения:**
- `~/.confluence_token` — токен Confluence (chmod 600)
- подключения к БД — модули в корне claude-workspace

**Корневой контекст:**
- `claude-workspace/CLAUDE.md` — роль, стек, общие правила окружения
