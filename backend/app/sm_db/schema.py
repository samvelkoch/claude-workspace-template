"""Описание схемы базы TalkToData (MS SQL Server) для system prompt.

Захардкожено — runtime introspection даёт меньше полезной информации
и медленнее. Описывает 2 таблицы: dbo.DataTable (158K транзакций)
и dbo.DataCustomPropertyTable (10.8M EAV-расширений).
"""


_SCHEMA_MD = """\
## База TalkToData (MS SQL Server, T-SQL)

Корпоративные командировки X5 Retail Group (AGROTORG, PEREKRESTOK TD,
X5 RETAIL GROUP, KORPORATIVNY CENTR X5 и др.).

### Таблица `dbo.DataTable` (~158 907 строк)
Главная таблица бизнес-тревел транзакций. **Колонки с пробелами обязательно
обрамлять в `[]`**.

Ключевые колонки:
| Колонка | Тип | Описание |
|---|---|---|
| `[ID]` | int | первичный ключ записи |
| `[DataKey]` | varchar | ключ для JOIN с DataCustomPropertyTable |
| `[Status]` | varchar | `Sale`, `Refund`, `Exchange` |
| `[Type Of Service]` | varchar | `AIR`, `Rail`, `Hotel`, `Other`, `Visa`, `MCO` |
| `[Date of Sale]` | date | дата продажи (2025-01-01 … 2025-12-31) |
| `[Departure Date]` | date | дата отправления (до 2026-06-03) |
| `[Arrival Date]` | date | дата прибытия |
| `[Company name]` | varchar | юрлицо (AGROTORG, PEREKRESTOK TD, X5 RETAIL GROUP, KORPORATIVNY CENTR X5 …) |
| `[Amount, Rub]` | decimal | сумма в рублях (Sale +, Refund −) |
| `[Total amount, Rub]` | decimal | итоговая сумма с комиссиями |
| `[Penalty, Rub]` | decimal | штраф (для Refund/Exchange) |
| `[Commission, Rub]` | decimal | комиссия |
| `[Tax, Rub]` | decimal | налог |
| `[Tariff, Rub]` | decimal | базовый тариф |
| `[Carrier]` | varchar | перевозчик / отель / поставщик |
| `[Carrier code]` | varchar | код перевозчика |
| `[Route]` | varchar | маршрут (для AIR/Rail), напр. `MOW-LED` |
| `[Departure city]` | varchar | город отправления |
| `[Arrival city]` | varchar | город прибытия |
| `[Departure country]` | varchar | страна отправления |
| `[Arrival country]` | varchar | страна прибытия |
| `[Class of service]` | varchar | класс обслуживания |
| `[Hotel name]` | varchar | название отеля (Hotel) |
| `[Hotel city]` | varchar | город отеля |
| `[Hotel country]` | varchar | страна отеля |
| `[Number of nights]` | varchar | кол-во ночей (varchar! TRY_CAST) |
| `[Distance (km)]` | varchar | расстояние (varchar! TRY_CAST) |
| `[Co2 in kg]` | varchar | выбросы CO2 (varchar! TRY_CAST) |
| `[Number of segments]` | varchar | кол-во сегментов (varchar! TRY_CAST) |
| `[Duration]` | int | продолжительность поездки в днях |
| `[Passenger]` | varchar | имя пассажира |
| `[Booking number]` | varchar | номер брони |
| `[Order number]` | varchar | номер заказа |
| `[Ticket number]` | varchar | номер билета |
| `[Booking source]` | varchar | источник бронирования |
| `[Tariff code]` | varchar | код тарифа |
| `[Refundable]` | varchar | возвратность |

**Важно про varchar-числа:** многие поля, выглядящие числовыми, хранятся как
`varchar(400)`. При агрегации обязательно приводить через
`TRY_CAST([Distance (km)] AS decimal(18,2))` и фильтровать `IS NOT NULL`,
иначе SUM/AVG упадёт.

### Таблица `dbo.DataCustomPropertyTable` (~10.8M строк, EAV)
Кастомные атрибуты в формате Entity-Attribute-Value. Связь по `DataKey`.

| Колонка | Тип | Описание |
|---|---|---|
| `id` | int | PK |
| `DataKey` | varchar | FK → DataTable.DataKey |
| `DataName` | varchar | имя атрибута (см. список ниже) |
| `DataValue` | varchar | значение атрибута |

Уникальные `DataName` (25 шт):
`REQ PERSON NAME RUS`, `EMPLOYEE ID`, `MVZ`, `GRADE`, `DIRECTION`,
`DEPARTAMENT`, `LEVEL 5`, `LEVEL 6`, `LEVEL 7`, `LEVEL 8`, `LEVEL 9`,
`TRIP TYPE`, `TRIP PURPOSE`, `RUNNING`, `ONLINE OFFLINE`,
`TIME BUSINESSTRIP NUMBER`, `TRIP NUMBER INTERNAL FROM TRIP`, `CO FILIAL`,
`PRIVATE TRIP`, `COVID DOCUMENT AVAILABILITY`, `PURPOSE OF TRIP`,
`AUTHORIZED ID`, `Реестр`, `DIRECTION CHIEF`, `TIME REQ ID`.

JOIN-шаблон:
```sql
SELECT t.[ID], t.[Amount, Rub], cp.DataValue AS employee_id
FROM dbo.DataTable t
LEFT JOIN dbo.DataCustomPropertyTable cp
       ON cp.DataKey = t.[DataKey] AND cp.DataName = 'EMPLOYEE ID'
WHERE t.[Status] = 'Sale' AND YEAR(t.[Date of Sale]) = 2025
```

Для разных EAV-атрибутов делайте отдельные `LEFT JOIN`-ы (или подзапросы)
— по одному на каждое имя атрибута.

### Период данных
- `[Date of Sale]`: 2025-01-01 … 2025-12-31
- `[Departure Date]`: до 2026-06-03

### Status semantics
- `Sale` — продажа, суммы положительные
- `Refund` — возврат, суммы **отрицательные** (учитывайте при SUM)
- `Exchange` — обмен билета
"""


def get_schema_summary() -> str:
    """Markdown-описание схемы для подстановки в system prompt."""
    return _SCHEMA_MD
