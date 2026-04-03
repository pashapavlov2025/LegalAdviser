"""Generates legal claim documents based on problem data."""

from datetime import datetime

from app.models import Claim, Problem, ProblemType


def _format_amount(amount: float) -> str:
    """Format amount in Russian style."""
    rub = int(amount)
    kop = int(round((amount - rub) * 100))
    return f"{rub:,} руб. {kop:02d} коп.".replace(",", " ")


def generate_claim(problem: Problem) -> Claim:
    """Generate a legal claim (претензия) for the given problem."""

    generators = {
        ProblemType.LATE_DELIVERY: _claim_late_delivery,
        ProblemType.DEFECTIVE_GOODS: _claim_defective_goods,
        ProblemType.INCORRECT_INVOICE: _claim_incorrect_invoice,
        ProblemType.CONTRACT_VIOLATION: _claim_contract_violation,
        ProblemType.NON_PAYMENT: _claim_non_payment,
    }

    gen = generators[problem.problem_type]
    text = gen(problem)

    return Claim(
        id=f"CLM-{problem.id}",
        problem_id=problem.id,
        generated_at=datetime.now(),
        text=text,
        recipient=problem.counterparty.contact_email,
    )


def _header(problem: Problem) -> str:
    return f"""ПРЕТЕНЗИЯ

Кому: {problem.counterparty.name}
ИНН: {problem.counterparty.inn}
Адрес: {problem.counterparty.address}

Дата: {datetime.now().strftime("%d.%m.%Y")}
Исх. №: {problem.id}/П

В связи с исполнением Договора № {problem.contract_number} от {problem.contract_date.strftime("%d.%m.%Y")} (далее — «Договор»), сообщаем следующее.
"""


def _footer(problem: Problem) -> str:
    return f"""
На основании изложенного, просим Вас в срок 10 (десять) рабочих дней с момента получения настоящей претензии удовлетворить указанные требования.

В случае неудовлетворения претензии в указанный срок, мы будем вынуждены обратиться в Арбитражный суд для защиты своих законных прав и интересов, с отнесением на Вашу сторону всех судебных расходов.

Приложения:
1. Копия Договора № {problem.contract_number} от {problem.contract_date.strftime("%d.%m.%Y")}
2. Документы, подтверждающие нарушение

С уважением,
_____________________
(подпись, должность, ФИО)"""


def _claim_late_delivery(p: Problem) -> str:
    return _header(p) + f"""
В соответствии с условиями Договора, поставка товаров должна была быть осуществлена в установленный срок.

{p.description}

Сумма задержанной поставки составляет {_format_amount(p.amount)}.

В соответствии со ст. 521 Гражданского кодекса Российской Федерации, а также п. 3.2 Договора, Поставщик обязан уплатить неустойку за нарушение сроков поставки.

ТРЕБУЕМ:
1. Незамедлительно осуществить поставку товара в полном объёме.
2. Уплатить неустойку за просрочку поставки в соответствии с условиями Договора.
""" + _footer(p)


def _claim_defective_goods(p: Problem) -> str:
    return _header(p) + f"""
При приёмке товара, поставленного по Договору, были выявлены существенные недостатки.

{p.description}

Стоимость дефектного товара составляет {_format_amount(p.amount)}.

В соответствии со ст. 475, 518 Гражданского кодекса Российской Федерации, покупатель вправе потребовать замены товара ненадлежащего качества.

ТРЕБУЕМ:
1. Произвести замену дефектного товара на товар надлежащего качества в течение 10 рабочих дней.
2. Возместить расходы, связанные с приёмкой и хранением дефектного товара.
""" + _footer(p)


def _claim_incorrect_invoice(p: Problem) -> str:
    return _header(p) + f"""
Нами установлено несоответствие выставленного счёта условиям Договора.

{p.description}

Сумма завышения составляет {_format_amount(p.amount)}.

В соответствии со ст. 424 Гражданского кодекса Российской Федерации, исполнение договора оплачивается по цене, установленной соглашением сторон.

ТРЕБУЕМ:
1. Выставить корректный счёт в соответствии с условиями Договора и согласованной спецификацией.
2. Аннулировать ранее выставленный некорректный счёт.
""" + _footer(p)


def _claim_contract_violation(p: Problem) -> str:
    return _header(p) + f"""
Нами выявлено существенное нарушение условий Договора.

{p.description}

В соответствии со ст. 309, 310 Гражданского кодекса Российской Федерации, обязательства должны исполняться надлежащим образом в соответствии с условиями обязательства. Односторонний отказ от исполнения обязательства не допускается.

ТРЕБУЕМ:
1. Немедленно устранить допущенное нарушение условий Договора.
2. Предоставить письменные объяснения по факту нарушения.
3. Гарантировать недопущение подобных нарушений в дальнейшем.
""" + _footer(p)


def _claim_non_payment(p: Problem) -> str:
    return _header(p) + f"""
По состоянию на текущую дату Вами не исполнена обязанность по оплате в рамках Договора.

{p.description}

Сумма задолженности составляет {_format_amount(p.amount)}.

В соответствии со ст. 309, 310, 395 Гражданского кодекса Российской Федерации, должник обязан возместить кредитору убытки, причинённые неисполнением обязательства, а также уплатить проценты за пользование чужими денежными средствами.

ТРЕБУЕМ:
1. Погасить задолженность в размере {_format_amount(p.amount)} в течение 10 рабочих дней.
2. Уплатить проценты за пользование чужими денежными средствами в соответствии со ст. 395 ГК РФ.
""" + _footer(p)
