"""Mock 1C integration — simulates fetching data from 1C:Enterprise."""

from datetime import date

from app.models import Counterparty, Problem, ProblemStatus, ProblemType

# Simulated counterparties
_COUNTERPARTIES = [
    Counterparty(
        id="CP-001",
        name='ООО "СтройМонтаж"',
        inn="7701234567",
        address="г. Москва, ул. Строителей, д. 15, оф. 301",
        contact_email="info@stroymontazh.ru",
    ),
    Counterparty(
        id="CP-002",
        name='АО "ТехноСервис"',
        inn="7802345678",
        address="г. Санкт-Петербург, пр. Науки, д. 42",
        contact_email="office@technoservice.ru",
    ),
    Counterparty(
        id="CP-003",
        name='ИП Козлов А.В.',
        inn="770312345678",
        address="г. Казань, ул. Баумана, д. 8, кв. 12",
        contact_email="kozlov.av@mail.ru",
    ),
]

# Simulated problems from 1C
_PROBLEMS: list[Problem] = [
    Problem(
        id="PRB-2024-001",
        date=date(2024, 11, 15),
        counterparty=_COUNTERPARTIES[0],
        problem_type=ProblemType.LATE_DELIVERY,
        description="Поставка строительных материалов по договору задержана на 14 дней. "
        "Согласно п. 3.2 договора срок поставки — 01.11.2024, фактическая поставка — 15.11.2024.",
        amount=1_250_000.00,
        contract_number="СМ-2024/089",
        contract_date=date(2024, 9, 1),
        status=ProblemStatus.NEW,
    ),
    Problem(
        id="PRB-2024-002",
        date=date(2024, 12, 3),
        counterparty=_COUNTERPARTIES[1],
        problem_type=ProblemType.DEFECTIVE_GOODS,
        description="Из партии серверного оборудования (50 ед.) 8 единиц имеют механические "
        "повреждения корпуса, выявленные при приёмке. Составлен акт о выявленных недостатках №12.",
        amount=640_000.00,
        contract_number="ТС-2024/156",
        contract_date=date(2024, 10, 15),
        status=ProblemStatus.NEW,
    ),
    Problem(
        id="PRB-2024-003",
        date=date(2024, 12, 10),
        counterparty=_COUNTERPARTIES[2],
        problem_type=ProblemType.NON_PAYMENT,
        description="Не произведена оплата за выполненные работы по отделке помещения. "
        "Акт выполненных работ подписан 10.11.2024, срок оплаты по договору — 30 дней.",
        amount=385_000.00,
        contract_number="ОТД-2024/034",
        contract_date=date(2024, 8, 20),
        status=ProblemStatus.IN_PROGRESS,
    ),
    Problem(
        id="PRB-2025-001",
        date=date(2025, 1, 20),
        counterparty=_COUNTERPARTIES[1],
        problem_type=ProblemType.INCORRECT_INVOICE,
        description="Выставлен счёт на сумму 890 000 руб. вместо 720 000 руб. по договору. "
        "Завышение на 170 000 руб. не соответствует спецификации (приложение №2 к договору).",
        amount=170_000.00,
        contract_number="ТС-2024/156",
        contract_date=date(2024, 10, 15),
        status=ProblemStatus.NEW,
    ),
    Problem(
        id="PRB-2025-002",
        date=date(2025, 2, 5),
        counterparty=_COUNTERPARTIES[0],
        problem_type=ProblemType.CONTRACT_VIOLATION,
        description="Подрядчик привлёк субподрядчика без письменного согласования с заказчиком, "
        "что является нарушением п. 5.1 договора. Выявлено при проверке объекта 05.02.2025.",
        amount=0.0,
        contract_number="СМ-2024/089",
        contract_date=date(2024, 9, 1),
        status=ProblemStatus.NEW,
    ),
]


def fetch_problems() -> list[Problem]:
    """Simulate fetching problems from 1C:Enterprise via OData/REST API."""
    return _PROBLEMS.copy()


def get_problem_by_id(problem_id: str) -> Problem | None:
    for p in _PROBLEMS:
        if p.id == problem_id:
            return p.copy()
    return None


def update_problem_status(problem_id: str, status: ProblemStatus) -> bool:
    for p in _PROBLEMS:
        if p.id == problem_id:
            p.status = status
            return True
    return False
