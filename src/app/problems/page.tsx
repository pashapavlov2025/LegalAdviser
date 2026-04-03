"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Problem,
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

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/problems").then((r) => r.json()).then(setProblems);
  }, []);

  const filtered = filter === "all"
    ? problems
    : problems.filter((p) => p.status === filter);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Проблемы</h2>
          <p className="text-sm text-gray-500">
            Все проблемы с контрагентами
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          + Новая проблема
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { value: "all", label: "Все" },
          { value: ProblemStatus.NEW, label: "Новые" },
          { value: ProblemStatus.IN_PROGRESS, label: "В работе" },
          { value: ProblemStatus.CLAIM_GENERATED, label: "Претензии" },
          { value: ProblemStatus.SENT, label: "Отправлены" },
          { value: ProblemStatus.RESOLVED, label: "Решены" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === f.value
                ? "bg-[#1a365d] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
            {f.value === "all" ? ` (${problems.length})` : ` (${problems.filter((p) => p.status === f.value).length})`}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-6">
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
            {filtered.map((p) => (
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                  Нет проблем с выбранным статусом
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-400 text-sm">
            Нет проблем с выбранным статусом
          </div>
        )}
        {filtered.map((p) => (
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
