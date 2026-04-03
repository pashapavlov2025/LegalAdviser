"""Data models for the Legal Adviser application."""

from datetime import date, datetime
from enum import Enum
from pydantic import BaseModel


class ProblemStatus(str, Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    CLAIM_GENERATED = "claim_generated"
    SENT = "sent"
    RESOLVED = "resolved"


class ProblemType(str, Enum):
    LATE_DELIVERY = "late_delivery"
    DEFECTIVE_GOODS = "defective_goods"
    INCORRECT_INVOICE = "incorrect_invoice"
    CONTRACT_VIOLATION = "contract_violation"
    NON_PAYMENT = "non_payment"


PROBLEM_TYPE_LABELS = {
    ProblemType.LATE_DELIVERY: "Нарушение сроков поставки",
    ProblemType.DEFECTIVE_GOODS: "Поставка бракованного товара",
    ProblemType.INCORRECT_INVOICE: "Некорректное выставление счёта",
    ProblemType.CONTRACT_VIOLATION: "Нарушение условий договора",
    ProblemType.NON_PAYMENT: "Неоплата по договору",
}

STATUS_LABELS = {
    ProblemStatus.NEW: "Новая",
    ProblemStatus.IN_PROGRESS: "В работе",
    ProblemStatus.CLAIM_GENERATED: "Претензия сформирована",
    ProblemStatus.SENT: "Отправлена",
    ProblemStatus.RESOLVED: "Решена",
}


class Counterparty(BaseModel):
    id: str
    name: str
    inn: str
    address: str
    contact_email: str


class Problem(BaseModel):
    id: str
    date: date
    counterparty: Counterparty
    problem_type: ProblemType
    description: str
    amount: float
    contract_number: str
    contract_date: date
    status: ProblemStatus = ProblemStatus.NEW


class Claim(BaseModel):
    id: str
    problem_id: str
    generated_at: datetime
    text: str
    recipient: str
    sent: bool = False
