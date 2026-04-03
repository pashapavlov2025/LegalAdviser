import { Counterparty, Problem, ProblemStatus, ProblemType } from "./models";

const counterparties: Counterparty[] = [
  {
    id: "CP-001",
    name: 'ООО "СтройМонтаж"',
    inn: "7701234567",
    address: "г. Москва, ул. Строителей, д. 15, оф. 301",
    contactEmail: "info@stroymontazh.ru",
  },
  {
    id: "CP-002",
    name: 'АО "ТехноСервис"',
    inn: "7802345678",
    address: "г. Санкт-Петербург, пр. Науки, д. 42",
    contactEmail: "office@technoservice.ru",
  },
  {
    id: "CP-003",
    name: "ИП Козлов А.В.",
    inn: "770312345678",
    address: "г. Казань, ул. Баумана, д. 8, кв. 12",
    contactEmail: "kozlov.av@mail.ru",
  },
];

const problems: Problem[] = [
  {
    id: "PRB-2024-001",
    date: "2024-11-15",
    counterparty: counterparties[0],
    problemType: ProblemType.LATE_DELIVERY,
    description:
      "Поставка строительных материалов по договору задержана на 14 дней. Согласно п. 3.2 договора срок поставки — 01.11.2024, фактическая поставка — 15.11.2024.",
    amount: 1_250_000,
    contractNumber: "СМ-2024/089",
    contractDate: "2024-09-01",
    status: ProblemStatus.NEW,
  },
  {
    id: "PRB-2024-002",
    date: "2024-12-03",
    counterparty: counterparties[1],
    problemType: ProblemType.DEFECTIVE_GOODS,
    description:
      "Из партии серверного оборудования (50 ед.) 8 единиц имеют механические повреждения корпуса, выявленные при приёмке. Составлен акт о выявленных недостатках №12.",
    amount: 640_000,
    contractNumber: "ТС-2024/156",
    contractDate: "2024-10-15",
    status: ProblemStatus.NEW,
  },
  {
    id: "PRB-2024-003",
    date: "2024-12-10",
    counterparty: counterparties[2],
    problemType: ProblemType.NON_PAYMENT,
    description:
      "Не произведена оплата за выполненные работы по отделке помещения. Акт выполненных работ подписан 10.11.2024, срок оплаты по договору — 30 дней.",
    amount: 385_000,
    contractNumber: "ОТД-2024/034",
    contractDate: "2024-08-20",
    status: ProblemStatus.IN_PROGRESS,
  },
  {
    id: "PRB-2025-001",
    date: "2025-01-20",
    counterparty: counterparties[1],
    problemType: ProblemType.INCORRECT_INVOICE,
    description:
      "Выставлен счёт на сумму 890 000 руб. вместо 720 000 руб. по договору. Завышение на 170 000 руб. не соответствует спецификации (приложение №2 к договору).",
    amount: 170_000,
    contractNumber: "ТС-2024/156",
    contractDate: "2024-10-15",
    status: ProblemStatus.NEW,
  },
  {
    id: "PRB-2025-002",
    date: "2025-02-05",
    counterparty: counterparties[0],
    problemType: ProblemType.CONTRACT_VIOLATION,
    description:
      "Подрядчик привлёк субподрядчика без письменного согласования с заказчиком, что является нарушением п. 5.1 договора. Выявлено при проверке объекта 05.02.2025.",
    amount: 0,
    contractNumber: "СМ-2024/089",
    contractDate: "2024-09-01",
    status: ProblemStatus.NEW,
  },
];

export function fetchProblems(): Problem[] {
  return problems.map((p) => ({ ...p }));
}

export function getProblemById(id: string): Problem | null {
  const p = problems.find((x) => x.id === id);
  return p ? { ...p } : null;
}

export function updateProblemStatus(id: string, status: ProblemStatus): boolean {
  const p = problems.find((x) => x.id === id);
  if (p) {
    p.status = status;
    return true;
  }
  return false;
}
