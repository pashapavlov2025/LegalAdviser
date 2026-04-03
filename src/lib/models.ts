export enum ProblemStatus {
  NEW = "new",
  IN_PROGRESS = "in_progress",
  CLAIM_GENERATED = "claim_generated",
  SENT = "sent",
  RESOLVED = "resolved",
}

export enum ProblemType {
  LATE_DELIVERY = "late_delivery",
  DEFECTIVE_GOODS = "defective_goods",
  INCORRECT_INVOICE = "incorrect_invoice",
  CONTRACT_VIOLATION = "contract_violation",
  NON_PAYMENT = "non_payment",
}

export const PROBLEM_TYPE_LABELS: Record<ProblemType, string> = {
  [ProblemType.LATE_DELIVERY]: "Нарушение сроков поставки",
  [ProblemType.DEFECTIVE_GOODS]: "Поставка бракованного товара",
  [ProblemType.INCORRECT_INVOICE]: "Некорректное выставление счёта",
  [ProblemType.CONTRACT_VIOLATION]: "Нарушение условий договора",
  [ProblemType.NON_PAYMENT]: "Неоплата по договору",
};

export const STATUS_LABELS: Record<ProblemStatus, string> = {
  [ProblemStatus.NEW]: "Новая",
  [ProblemStatus.IN_PROGRESS]: "В работе",
  [ProblemStatus.CLAIM_GENERATED]: "Претензия сформирована",
  [ProblemStatus.SENT]: "Отправлена",
  [ProblemStatus.RESOLVED]: "Решена",
};

export interface Counterparty {
  id: string;
  name: string;
  inn: string;
  address: string;
  contactEmail: string;
}

export interface Problem {
  id: string;
  date: string;
  counterparty: Counterparty;
  problemType: ProblemType;
  description: string;
  amount: number;
  contractNumber: string;
  contractDate: string;
  status: ProblemStatus;
}

export interface Claim {
  id: string;
  problemId: string;
  generatedAt: string;
  text: string;
  recipient: string;
  sent: boolean;
}
