import { Claim, Problem, PROBLEM_TYPE_LABELS } from "./models";
import { generateClaim } from "./claim-generator";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatAmount(amount: number): string {
  const rub = Math.floor(amount);
  const kop = Math.round((amount - rub) * 100);
  return `${rub.toLocaleString("ru-RU")} руб. ${kop.toString().padStart(2, "0")} коп.`;
}

export async function generateClaimAI(problem: Problem): Promise<Claim> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Fallback to template generation with AI marker
    const fallback = generateClaim(problem);
    fallback.text = "[ Сгенерировано шаблоном — для AI-генерации укажите ANTHROPIC_API_KEY ]\n\n" + fallback.text;
    return fallback;
  }

  const prompt = `Ты — опытный корпоративный юрист в России. Составь юридическую претензию (досудебную) на основании следующих данных:

Контрагент: ${problem.counterparty.name}
ИНН: ${problem.counterparty.inn}
Адрес: ${problem.counterparty.address}
Тип проблемы: ${PROBLEM_TYPE_LABELS[problem.problemType]}
Описание: ${problem.description}
Сумма: ${problem.amount > 0 ? formatAmount(problem.amount) : "не указана"}
Договор: № ${problem.contractNumber} от ${formatDate(problem.contractDate)}

Требования к претензии:
1. Начни с заголовка "ПРЕТЕНЗИЯ"
2. Укажи реквизиты получателя
3. Сошлись на конкретные статьи Гражданского кодекса РФ
4. Чётко сформулируй требования (ТРЕБУЕМ:)
5. Установи срок ответа 10 рабочих дней
6. Укажи на возможность обращения в Арбитражный суд
7. Закончи местом для подписи
8. Пиши формальным юридическим языком

Выведи только текст претензии, без пояснений.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    return {
      id: `CLM-${problem.id}`,
      problemId: problem.id,
      generatedAt: new Date().toISOString(),
      text,
      recipient: problem.counterparty.contactEmail,
      sent: false,
    };
  } catch {
    // Fallback to template
    const fallback = generateClaim(problem);
    fallback.text = "[ AI недоступен — использован шаблон ]\n\n" + fallback.text;
    return fallback;
  }
}
