import { Claim, Problem, ProblemType } from "./models";

function formatAmount(amount: number): string {
  const rub = Math.floor(amount);
  const kop = Math.round((amount - rub) * 100);
  return `${rub.toLocaleString("ru-RU")} руб. ${kop.toString().padStart(2, "0")} коп.`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function todayFormatted(): string {
  return new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function header(p: Problem): string {
  return `ПРЕТЕНЗИЯ

Кому: ${p.counterparty.name}
ИНН: ${p.counterparty.inn}
Адрес: ${p.counterparty.address}

Дата: ${todayFormatted()}
Исх. №: ${p.id}/П

В связи с исполнением Договора № ${p.contractNumber} от ${formatDate(p.contractDate)} (далее — «Договор»), сообщаем следующее.
`;
}

function footer(p: Problem): string {
  return `
На основании изложенного, просим Вас в срок 10 (десять) рабочих дней с момента получения настоящей претензии удовлетворить указанные требования.

В случае неудовлетворения претензии в указанный срок, мы будем вынуждены обратиться в Арбитражный суд для защиты своих законных прав и интересов, с отнесением на Вашу сторону всех судебных расходов.

Приложения:
1. Копия Договора № ${p.contractNumber} от ${formatDate(p.contractDate)}
2. Документы, подтверждающие нарушение

С уважением,
_____________________
(подпись, должность, ФИО)`;
}

function claimLateDelivery(p: Problem): string {
  return header(p) + `
В соответствии с условиями Договора, поставка товаров должна была быть осуществлена в установленный срок.

${p.description}

Сумма задержанной поставки составляет ${formatAmount(p.amount)}.

В соответствии со ст. 521 Гражданского кодекса Российской Федерации, а также п. 3.2 Договора, Поставщик обязан уплатить неустойку за нарушение сроков поставки.

ТРЕБУЕМ:
1. Незамедлительно осуществить поставку товара в полном объёме.
2. Уплатить неустойку за просрочку поставки в соответствии с условиями Договора.
` + footer(p);
}

function claimDefectiveGoods(p: Problem): string {
  return header(p) + `
При приёмке товара, поставленного по Договору, были выявлены существенные недостатки.

${p.description}

Стоимость дефектного товара составляет ${formatAmount(p.amount)}.

В соответствии со ст. 475, 518 Гражданского кодекса Российской Федерации, покупатель вправе потребовать замены товара ненадлежащего качества.

ТРЕБУЕМ:
1. Произвести замену дефектного товара на товар надлежащего качества в течение 10 рабочих дней.
2. Возместить расходы, связанные с приёмкой и хранением дефектного товара.
` + footer(p);
}

function claimIncorrectInvoice(p: Problem): string {
  return header(p) + `
Нами установлено несоответствие выставленного счёта условиям Договора.

${p.description}

Сумма завышения составляет ${formatAmount(p.amount)}.

В соответствии со ст. 424 Гражданского кодекса Российской Федерации, исполнение договора оплачивается по цене, установленной соглашением сторон.

ТРЕБУЕМ:
1. Выставить корректный счёт в соответствии с условиями Договора и согласованной спецификацией.
2. Аннулировать ранее выставленный некорректный счёт.
` + footer(p);
}

function claimContractViolation(p: Problem): string {
  return header(p) + `
Нами выявлено существенное нарушение условий Договора.

${p.description}

В соответствии со ст. 309, 310 Гражданского кодекса Российской Федерации, обязательства должны исполняться надлежащим образом в соответствии с условиями обязательства. Односторонний отказ от исполнения обязательства не допускается.

ТРЕБУЕМ:
1. Немедленно устранить допущенное нарушение условий Договора.
2. Предоставить письменные объяснения по факту нарушения.
3. Гарантировать недопущение подобных нарушений в дальнейшем.
` + footer(p);
}

function claimNonPayment(p: Problem): string {
  return header(p) + `
По состоянию на текущую дату Вами не исполнена обязанность по оплате в рамках Договора.

${p.description}

Сумма задолженности составляет ${formatAmount(p.amount)}.

В соответствии со ст. 309, 310, 395 Гражданского кодекса Российской Федерации, должник обязан возместить кредитору убытки, причинённые неисполнением обязательства, а также уплатить проценты за пользование чужими денежными средствами.

ТРЕБУЕМ:
1. Погасить задолженность в размере ${formatAmount(p.amount)} в течение 10 рабочих дней.
2. Уплатить проценты за пользование чужими денежными средствами в соответствии со ст. 395 ГК РФ.
` + footer(p);
}

const generators: Record<ProblemType, (p: Problem) => string> = {
  [ProblemType.LATE_DELIVERY]: claimLateDelivery,
  [ProblemType.DEFECTIVE_GOODS]: claimDefectiveGoods,
  [ProblemType.INCORRECT_INVOICE]: claimIncorrectInvoice,
  [ProblemType.CONTRACT_VIOLATION]: claimContractViolation,
  [ProblemType.NON_PAYMENT]: claimNonPayment,
};

export function generateClaim(problem: Problem): Claim {
  const text = generators[problem.problemType](problem);
  return {
    id: `CLM-${problem.id}`,
    problemId: problem.id,
    generatedAt: new Date().toISOString(),
    text,
    recipient: problem.counterparty.contactEmail,
    sent: false,
  };
}
