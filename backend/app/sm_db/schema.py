"""Описание схемы базы TalkToData (MS SQL Server) для system prompt.

Описывает 2 таблицы: dbo.DataTable (158K транзакций бизнес-тревел X5)
и dbo.DataCustomPropertyTable (10.8M EAV-расширений).

Колонки и русские описания взяты из реальной схемы БД
(INFORMATION_SCHEMA.COLUMNS) и пользовательского Excel-шаблона
S_and_M_X5.xlsx — оба источника совпадают позиционно.
"""


_SCHEMA_MD = """\
## База TalkToData (MS SQL Server, T-SQL)

Корпоративные командировки X5 Retail Group (юрлица: AGROTORG, PEREKRESTOK TD,
KORPORATIVNY CENTR X5, AGRO-AVTO, X5 SINERGIYA, X5 RETAIL GROUP, PRODTORG,
X5 DIGITAL и др.).

### Таблица `dbo.DataTable` (~158 907 строк)
Главная таблица бизнес-тревел транзакций (авиа / ж/д / отели / прочее).
**Колонки с пробелами и спецсимволами обязательно обрамлять в `[]`.**

| Колонка | Тип | Описание (RU) |
|---|---|---|
| `[ID]` | int | первичный ключ записи |
| `[DataKey]` | varchar | ключ для JOIN с DataCustomPropertyTable |
| `[Status]` | varchar | Статус (`Sale`, `Refund`, `Exchange`) |
| `[Type Of Service]` | varchar | Тип услуги (`AIR`, `Rail`, `Hotel`, `Other`, `Visa`, `MCO`) |
| `[Service]` | varchar | Услуга |
| `[GDS]` | varchar | GDS-провайдер (Sirena, PortBilet, Amadeus...) |
| `[Date of booking]` | date | Дата бронирования |
| `[Date of Sale]` | date | Дата оформления (2025-01-01 … 2025-12-31) |
| `[Departure Date]` | date | Дата отправления (до 2026-06-03) |
| `[Return Date]` | date | Дата возврата |
| `[Invoice Date]` | date | Дата выставления счёта |
| `[Itinerary]` | varchar | Маршрут (текст) |
| `[Departure airport code]` | varchar | Код аэропорта вылета (IATA) |
| `[Arrival airport code]` | varchar | Код аэропорта прибытия (IATA) |
| `[Origin city]` | varchar | Город отправления |
| `[Point of Destination]` | varchar | Город прибытия |
| `[Origin Country]` | varchar | Страна отправления |
| `[Destination country]` | varchar | Страна прибытия |
| `[Route (code)]` | varchar | Маршрут (коды), напр. `MOW-LED` |
| `[Hotel]` | varchar | Название отеля |
| `[Hotel category]` | varchar | Категория отеля |
| `[Hotel chain]` | varchar | Сеть отеля |
| `[Room category]` | varchar | Категория номера |
| `[Class of Service]` | varchar | Класс обслуживания (для авиа) |
| `[Class of Service RW]` | varchar | Класс обслуживания Ж/Д |
| `[Airline code (carrier)]` | varchar | Код перевозчика |
| `[Airline name (carrier)]` | varchar | Название перевозчика |
| `[Flight number]` | varchar | Номер рейса |
| `[Booking Code]` | varchar | Код бронирования (тариф) |
| `[Fare basis]` | varchar | Код тарифа |
| `[Train Name]` | varchar | Название поезда |
| `[Train Number]` | varchar | Номер поезда |
| `[Amount, Rub]` | decimal | Стоимость, Руб (Sale +, Refund −) |
| `[Amount, excluding VAT]` | decimal | Сумма без НДС, Руб |
| `[VAT, Rub]` | decimal | НДС, Руб |
| `[Penalty, Rub (for refund/exchange)]` | decimal | Штрафы за возврат/обмен, Руб |
| `[Transaction fee, Rub]` | decimal | Сервисный сбор, Руб |
| `[Total amount, Rub]` | decimal | Итого с комиссиями и НДС, Руб |
| `[Total, excluding VAT, Rub]` | decimal | Итого с комиссией без НДС, Руб |
| `[Total VAT, Rub]` | decimal | Итого НДС, Руб |
| `[Ticket fare]` | decimal | Базовый тариф |
| `[Total accommodation rate]` | varchar | Общая стоимость проживания (varchar! TRY_CAST) |
| `[Rate per night]` | varchar | Стоимость в сутки (varchar! TRY_CAST) |
| `[Form of payment]` | varchar | Форма оплаты |
| `[Company name]` | varchar | Юрлицо-плательщик |
| `[Invoice]` | varchar | Номер счёта |
| `[Passenger name (PERSON)]` | varchar | Имя пассажира |
| `[Agent Name]` | varchar | ФИО агента |
| `[Duration]` | int | Длительность поездки (для отелей — кол-во ночей) |
| `[Number of segments]` | varchar | Кол-во сегментов (varchar! TRY_CAST) |
| `[Distance (km)]` | varchar | Дистанция в км (varchar! TRY_CAST) |
| `[Co2 in kg]` | varchar | Выбросы CO₂, кг (varchar! TRY_CAST) |
| `[Provider]` | varchar | Поставщик |
| `[Resource]` | varchar | Приложение/канал |
| `[Record locator]` | varchar | Код бронирования GDS |
| `[ow/rt]` | varchar | One Way / Round Trip |
| `[Issue Type]` | varchar | Тип транзакции (Agent Online/Offline и т.д.) |
| `[Is Travel Policy Compliant]` | varchar | Соблюдение travel-policy (Y/N/N/A) |
| `[Is Corporate Hotel]` | varchar | Корпоративный отель |
| `[JourneyType]` | varchar | Тип поездки (например, `Командировка`) |
| `[Пол]` | varchar | Пол пассажира (M/F) |
| `[Дата рождения]` | varchar | Дата рождения пассажира (varchar) |

**varchar с числами:** многие "числовые" поля (`Distance (km)`, `Co2 in kg`,
`Number of segments`, `Total accommodation rate`, `Rate per night`)
хранятся как `varchar(400)`. Для агрегации обязательно
`TRY_CAST([Distance (km)] AS decimal(18,2))` + `WHERE ... IS NOT NULL`.

### Таблица `dbo.DataCustomPropertyTable` (~10.8M строк, EAV)
Кастомные клиент-специфичные атрибуты в формате Entity-Attribute-Value.
Связь по `DataKey`.

| Колонка | Тип | Описание |
|---|---|---|
| `id` | int | PK |
| `DataKey` | varchar | FK → DataTable.DataKey |
| `DataName` | varchar | имя атрибута (см. список) |
| `DataValue` | varchar | значение атрибута |

Доступные `DataName` (25 уникальных):
- `REQ PERSON NAME RUS` — ФИО заказчика на русском
- `EMPLOYEE ID` — табельный номер
- `MVZ` — место возникновения затрат
- `GRADE` — грейд сотрудника
- `DIRECTION` — направление (бизнес-юнит)
- `DEPARTAMENT` — подразделение
- `LEVEL 5`, `LEVEL 6`, `LEVEL 7`, `LEVEL 8`, `LEVEL 9` — уровни оргструктуры
- `TRIP TYPE`, `TRIP PURPOSE`, `PURPOSE OF TRIP` — тип/цель поездки
- `RUNNING` — статус выполнения
- `ONLINE OFFLINE` — канал бронирования
- `TIME BUSINESSTRIP NUMBER`, `TRIP NUMBER INTERNAL FROM TRIP`, `TIME REQ ID` — номера заявок
- `CO FILIAL` — филиал
- `PRIVATE TRIP` — личная поездка
- `COVID DOCUMENT AVAILABILITY` — наличие COVID-документов
- `AUTHORIZED ID` — ID согласующего
- `Реестр` — реестр
- `DIRECTION CHIEF` — руководитель направления

JOIN-шаблон (один LEFT JOIN на каждый нужный атрибут):
```sql
SELECT
  t.[Company name],
  cp_dep.DataValue AS departament,
  SUM(t.[Total amount, Rub]) AS total
FROM dbo.DataTable t
LEFT JOIN dbo.DataCustomPropertyTable cp_dep
       ON cp_dep.DataKey = t.[DataKey] AND cp_dep.DataName = 'DEPARTAMENT'
WHERE t.[Status] = 'Sale' AND YEAR(t.[Date of Sale]) = 2025
GROUP BY t.[Company name], cp_dep.DataValue
```

### Status semantics
- `Sale` — продажа (положительные суммы)
- `Refund` — возврат (**отрицательные** суммы — учитывайте при SUM)
- `Exchange` — обмен билета

### Период данных
- `[Date of Sale]`: 2025-01-01 … 2025-12-31
- `[Departure Date]`: до 2026-06-03

### Заметки по диалекту
- T-SQL: используйте `YEAR()`, `MONTH()`, `DATEFROMPARTS()`, `DATEADD()`
- Топ-N: `SELECT TOP 10 ...` (НЕ `LIMIT 10` — это PostgreSQL)
- Сравнение строк регистрозависимое только при collation `_CS_AS`
"""


def get_schema_summary() -> str:
    """Markdown-описание схемы для подстановки в system prompt."""
    return _SCHEMA_MD
