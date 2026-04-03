"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Problem,
  ProblemStatus,
  ProblemType,
  PROBLEM_TYPE_LABELS,
  STATUS_LABELS,
} from "@/lib/models";

const statusColors: Record<string, string> = {
  [ProblemStatus.NEW]: "#3b82f6",
  [ProblemStatus.IN_PROGRESS]: "#eab308",
  [ProblemStatus.CLAIM_GENERATED]: "#22c55e",
  [ProblemStatus.SENT]: "#a855f7",
  [ProblemStatus.RESOLVED]: "#94a3b8",
};

const typeColors: Record<string, string> = {
  [ProblemType.LATE_DELIVERY]: "#ef4444",
  [ProblemType.DEFECTIVE_GOODS]: "#f97316",
  [ProblemType.INCORRECT_INVOICE]: "#eab308",
  [ProblemType.CONTRACT_VIOLATION]: "#8b5cf6",
  [ProblemType.NON_PAYMENT]: "#ec4899",
};

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
  return new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function DashboardPage() {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    fetch("/api/problems").then((r) => r.json()).then(setProblems);
  }, []);

  const totalAmount = problems.reduce((s, p) => s + p.amount, 0);
  const newCount = problems.filter((p) => p.status === ProblemStatus.NEW).length;
  const claimsCount = problems.filter(
    (p) => p.status === ProblemStatus.CLAIM_GENERATED || p.status === ProblemStatus.SENT,
  ).length;
  const sentCount = problems.filter((p) => p.status === ProblemStatus.SENT).length;

  // Status distribution
  const statusCounts = Object.values(ProblemStatus).map((s) => ({
    status: s,
    label: STATUS_LABELS[s],
    count: problems.filter((p) => p.status === s).length,
    color: statusColors[s],
  }));

  // Type distribution
  const typeCounts = Object.values(ProblemType).map((t) => ({
    type: t,
    label: PROBLEM_TYPE_LABELS[t],
    count: problems.filter((p) => p.problemType === t).length,
    color: typeColors[t],
  })).filter((t) => t.count > 0);

  const maxTypeCount = Math.max(...typeCounts.map((t) => t.count), 1);

  // Recent problems (last 3)
  const recent = [...problems].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 md:mb-7">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Дашборд</h2>
          <p className="text-sm text-gray-500">Обзор юридической работы с контрагентами</p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          + Новая проблема
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-7">
        <KpiCard
          value={problems.length}
          label="Всего проблем"
          icon={
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          sub={`${newCount} новых`}
          subColor="text-blue-600"
        />
        <KpiCard
          value={formatAmount(totalAmount)}
          label="Общая сумма"
          icon={
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          sub="по всем проблемам"
          subColor="text-gray-500"
          isText
        />
        <KpiCard
          value={claimsCount}
          label="Претензий"
          icon={
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          sub={`${sentCount} отправлено`}
          subColor="text-green-600"
        />
        <KpiCard
          value={new Set(problems.map((p) => p.counterparty.id)).size}
          label="Контрагентов"
          icon={
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          sub="с проблемами"
          subColor="text-gray-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 mb-5 md:mb-7">
        {/* Status pipeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Воронка статусов
          </h3>
          <div className="space-y-3">
            {statusCounts.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{s.label}</span>
                  <span className="font-bold text-gray-800">{s.count}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: problems.length ? `${(s.count / problems.length) * 100}%` : "0%",
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Type distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            По типу проблем
          </h3>
          <div className="space-y-3">
            {typeCounts.map((t) => (
              <div key={t.type} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-600 truncate">{t.label}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(t.count / maxTypeCount) * 100}%`,
                        backgroundColor: t.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-800 w-5 text-right">{t.count}</span>
                </div>
              </div>
            ))}
            {typeCounts.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Нет данных</p>
            )}
          </div>
        </div>
      </div>

      {/* Amount by counterparty */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 mb-5 md:mb-7">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Суммы по контрагентам
        </h3>
        <div className="space-y-3">
          {(() => {
            const cpMap = new Map<string, { name: string; total: number; count: number }>();
            problems.forEach((p) => {
              const entry = cpMap.get(p.counterparty.id) || { name: p.counterparty.name, total: 0, count: 0 };
              entry.total += p.amount;
              entry.count++;
              cpMap.set(p.counterparty.id, entry);
            });
            const entries = [...cpMap.entries()].sort((a, b) => b[1].total - a[1].total);
            const maxTotal = Math.max(...entries.map(([, v]) => v.total), 1);
            return entries.map(([id, v]) => (
              <div key={id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 truncate mr-2">{v.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">{v.count} пробл.</span>
                    <span className="font-bold text-red-500">{formatAmount(v.total)}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                    style={{ width: `${(v.total / maxTotal) * 100}%` }}
                  />
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Recent problems */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Последние проблемы
          </h3>
          <Link href="/problems" className="text-sm text-blue-600 hover:underline">
            Все проблемы &rarr;
          </Link>
        </div>
        <div className="space-y-3">
          {recent.map((p) => (
            <Link
              key={p.id}
              href={`/problem/${p.id}`}
              className="flex items-center gap-4 p-3 -mx-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-lg font-bold"
                style={{ backgroundColor: typeColors[p.problemType] || "#6b7280" }}
              >
                {p.counterparty.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.counterparty.name}</div>
                <div className="text-xs text-gray-500 truncate">{PROBLEM_TYPE_LABELS[p.problemType]}</div>
              </div>
              <div className="text-right flex-shrink-0">
                {p.amount > 0 && (
                  <div className="text-sm font-bold text-red-500">{formatAmount(p.amount)}</div>
                )}
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeColor[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </span>
              </div>
            </Link>
          ))}
          {recent.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Нет данных</p>
          )}
        </div>
      </div>
    </>
  );
}

function KpiCard({
  value,
  label,
  icon,
  sub,
  subColor,
  isText,
}: {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  sub: string;
  subColor: string;
  isText?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="opacity-60">{icon}</div>
      </div>
      <div className={`${isText ? "text-lg md:text-xl" : "text-2xl md:text-3xl"} font-bold text-gray-900 mb-0.5`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-xs mt-1 ${subColor}`}>{sub}</div>
    </div>
  );
}
