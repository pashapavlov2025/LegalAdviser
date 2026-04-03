"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  Problem,
  Claim,
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

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [probRes, claimRes] = await Promise.all([
      fetch(`/api/problems`),
      fetch(`/api/claims/${id}`),
    ]);
    const problems: Problem[] = await probRes.json();
    const found = problems.find((p) => p.id === id) ?? null;
    setProblem(found);
    const c = await claimRes.json();
    setClaim(c);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleGenerate() {
    const res = await fetch(`/api/claims/${id}`, { method: "POST" });
    const c = await res.json();
    setClaim(c);
    if (problem) setProblem({ ...problem, status: ProblemStatus.CLAIM_GENERATED });
  }

  async function handleSend() {
    const res = await fetch(`/api/claims/${id}`, { method: "PUT" });
    const c = await res.json();
    setClaim(c);
    if (problem) setProblem({ ...problem, status: ProblemStatus.SENT });
  }

  if (loading) return <p className="text-gray-500">Загрузка...</p>;
  if (!problem) return <p className="text-red-500">Проблема не найдена</p>;

  return (
    <>
      <h2 className="text-xl md:text-2xl font-bold">Проблема {problem.id}</h2>
      <p className="text-sm mb-4 md:mb-6">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          &larr; Назад к списку
        </Link>
      </p>

      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 mb-4 md:mb-5">
        <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">
          Информация о проблеме
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <dt className="text-gray-500 text-xs uppercase tracking-wide">Контрагент</dt>
          <dd className="font-medium">{problem.counterparty.name} (ИНН {problem.counterparty.inn})</dd>

          <dt className="text-gray-500 text-xs uppercase tracking-wide">Адрес</dt>
          <dd className="font-medium">{problem.counterparty.address}</dd>

          <dt className="text-gray-500 text-xs uppercase tracking-wide">Тип проблемы</dt>
          <dd className="font-medium">{PROBLEM_TYPE_LABELS[problem.problemType]}</dd>

          <dt className="text-gray-500 text-xs uppercase tracking-wide">Дата выявления</dt>
          <dd className="font-medium">{formatDate(problem.date)}</dd>

          <dt className="text-gray-500 text-xs uppercase tracking-wide">Договор</dt>
          <dd className="font-medium">№ {problem.contractNumber} от {formatDate(problem.contractDate)}</dd>

          <dt className="text-gray-500 text-xs uppercase tracking-wide">Сумма</dt>
          <dd className="font-bold text-red-500">{formatAmount(problem.amount)}</dd>

          <dt className="text-gray-500 text-xs uppercase tracking-wide">Статус</dt>
          <dd>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeColor[problem.status]}`}>
              {STATUS_LABELS[problem.status]}
            </span>
          </dd>

          <dt className="text-gray-500 text-xs uppercase tracking-wide">Email контрагента</dt>
          <dd className="font-medium break-all">{problem.counterparty.contactEmail}</dd>
        </dl>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 mb-4 md:mb-5">
        <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">
          Описание
        </h3>
        <p className="text-sm">{problem.description}</p>
      </div>

      {claim ? (
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 mb-4 md:mb-5">
          <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">
            Сформированная претензия
            {claim.sent && (
              <span className="ml-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                Отправлена
              </span>
            )}
          </h3>
          <div className="claim-text bg-amber-50 border border-yellow-300 rounded-md p-3 md:p-5 text-xs md:text-[13px] max-h-[400px] md:max-h-[500px] overflow-y-auto">
            {claim.text}
          </div>
          <div className="mt-4 md:mt-5">
            {claim.sent ? (
              <span className="text-green-600 font-semibold text-sm">
                Претензия отправлена на {claim.recipient}
              </span>
            ) : (
              <button
                onClick={handleSend}
                className="w-full md:w-auto px-5 py-2.5 md:py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                Отправить на {claim.recipient}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-4 md:mt-5">
          <button
            onClick={handleGenerate}
            className="w-full md:w-auto px-5 py-2.5 md:py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Сформировать претензию
          </button>
        </div>
      )}
    </>
  );
}
