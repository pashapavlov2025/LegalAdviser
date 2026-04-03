import Link from "next/link";
import { fetchProblems } from "@/lib/mock-1c";
import {
  PROBLEM_TYPE_LABELS,
  STATUS_LABELS,
  ProblemStatus,
} from "@/lib/models";

const badgeColor: Record<string, string> = {
  [ProblemStatus.NEW]: "bg-blue-100 text-blue-700",
  [ProblemStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [ProblemStatus.CLAIM_GENERATED]: "bg-green-100 text-green-800",
  [ProblemStatus.SENT]: "bg-purple-100 text-purple-800",
  [ProblemStatus.RESOLVED]: "bg-gray-200 text-gray-600",
};

function formatAmount(n: number): string {
  if (!n) return "—";
  return n.toLocaleString("ru-RU") + " ₽";
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const problems = fetchProblems();
  const newCount = problems.filter((p) => p.status === ProblemStatus.NEW).length;
  const claimsCount = problems.filter(
    (p) => p.status === ProblemStatus.CLAIM_GENERATED || p.status === ProblemStatus.SENT,
  ).length;

  return (
    <>
      <h2 className="text-xl md:text-2xl font-bold">Проблемы из 1С</h2>
      <p className="text-sm text-gray-500 mb-4 md:mb-6">
        Данные загружены из 1С:Предприятие — список выявленных проблем с контрагентами
      </p>

      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
        {[
          { n: problems.length, l: "Всего проблем" },
          { n: newCount, l: "Новых" },
          { n: claimsCount, l: "Претензий" },
        ].map((s) => (
          <div key={s.l} className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#1a365d]">{s.n}</div>
            <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">
          Список проблем
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr>
              {["Номер", "Дата", "Контрагент", "Тип проблемы", "Сумма", "Статус"].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-2 bg-gray-100 text-xs uppercase tracking-wide text-gray-500 font-semibold"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {problems.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 border-b border-gray-100">
                  <Link href={`/problem/${p.id}`} className="text-blue-600 font-semibold hover:underline">
                    {p.id}
                  </Link>
                </td>
                <td className="px-3 py-3 border-b border-gray-100">{formatDate(p.date)}</td>
                <td className="px-3 py-3 border-b border-gray-100">{p.counterparty.name}</td>
                <td className="px-3 py-3 border-b border-gray-100">{PROBLEM_TYPE_LABELS[p.problemType]}</td>
                <td className="px-3 py-3 border-b border-gray-100">
                  {p.amount ? (
                    <span className="font-bold text-red-500">{formatAmount(p.amount)}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-3 border-b border-gray-100">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor[p.status]}`}>
                    {STATUS_LABELS[p.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {problems.map((p) => (
          <Link
            key={p.id}
            href={`/problem/${p.id}`}
            className="block bg-white border border-gray-200 rounded-lg p-4 active:bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-600 font-semibold text-sm">{p.id}</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor[p.status]}`}>
                {STATUS_LABELS[p.status]}
              </span>
            </div>
            <div className="text-sm font-medium mb-1">{p.counterparty.name}</div>
            <div className="text-xs text-gray-500 mb-2">{PROBLEM_TYPE_LABELS[p.problemType]}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{formatDate(p.date)}</span>
              {p.amount ? (
                <span className="font-bold text-red-500 text-sm">{formatAmount(p.amount)}</span>
              ) : (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
