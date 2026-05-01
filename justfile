set shell := ["bash", "-eu", "-o", "pipefail", "-c"]

# Список целей
default:
    @just --list

# Установка зависимостей (адаптировать под uv/poetry/pip-tools под проект)
install:
    @echo "TODO: настроить под менеджер пакетов проекта"
    # uv sync --all-extras

# Быстрая валидация baseline на сэмпле — после каждого изменения
baseline-quick:
    @echo "TODO: python src/baseline.py --quick (data/sample/, фикс. seed)"

# Полный baseline на всём датасете — перед коммитом результатов
baseline-full:
    @echo "TODO: python src/baseline.py --full"

# Прогон Oracle-проверок (см. секцию Oracle в CLAUDE.md)
oracle:
    @echo "TODO: oracle-проверки этого проекта"

# Создать/обновить детерминированный сэмпл из raw
sample:
    @echo "TODO: python src/make_sample.py → data/sample/"

# Линтер (ruff/black — что в проекте)
lint:
    @echo "TODO: ruff check src/"

# Автоформат
format:
    @echo "TODO: ruff format src/"

# Тесты (если появятся)
test:
    @echo "TODO: pytest tests/"
