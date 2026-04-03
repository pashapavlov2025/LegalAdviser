"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Problem,
  Claim,
  TimelineEvent,
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

const eventIcons: Record<string, string> = {
  created: "📋",
  status_changed: "🔄",
  claim_generated: "📝",
  claim_edited: "✏️",
  claim_sent: "📤",
  comment: "💬",
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

function formatDateTime(d: string): string {
  return new Date(d).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadData = useCallback(async () => {
    const [probRes, claimRes, timelineRes] = await Promise.all([
      fetch(`/api/problems`),
      fetch(`/api/claims/${id}`),
      fetch(`/api/timeline/${id}`),
    ]);
    const problems: Problem[] = await probRes.json();
    setProblem(problems.find((p) => p.id === id) ?? null);
    setClaim(await claimRes.json());
    setTimeline(await timelineRes.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleGenerate(useAI: boolean) {
    setGenerating(true);
    const res = await fetch(`/api/claims/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ useAI }),
    });
    const c = await res.json();
    setClaim(c);
    if (problem) setProblem({ ...problem, status: ProblemStatus.CLAIM_GENERATED });
    // Reload timeline
    const tlRes = await fetch(`/api/timeline/${id}`);
    setTimeline(await tlRes.json());
    setGenerating(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText }),
    });
    const c = await res.json();
    setClaim(c);
    setEditing(false);
    const tlRes = await fetch(`/api/timeline/${id}`);
    setTimeline(await tlRes.json());
    setSaving(false);
  }

  async function handleSend() {
    const res = await fetch(`/api/claims/${id}`, { method: "PUT" });
    const c = await res.json();
    setClaim(c);
    if (problem) setProblem({ ...problem, status: ProblemStatus.SENT });
    const tlRes = await fetch(`/api/timeline/${id}`);
    setTimeline(await tlRes.json());
  }

  async function handleAddComment() {
    if (!comment.trim()) return;
    await fetch(`/api/timeline/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: comment }),
    });
    setComment("");
    const tlRes = await fetch(`/api/timeline/${id}`);
    setTimeline(await tlRes.json());
  }

  function handleStartEdit() {
    if (claim) {
      setEditText(claim.text);
      setEditing(true);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }

  function handleExportPDF() {
    if (!claim || !problem) return;
    // Generate a printable HTML and open print dialog
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Претензия ${problem.id}</title>
<style>
  body { font-family: "Times New Roman", serif; font-size: 14px; line-height: 1.8; margin: 40px 60px; color: #000; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.8; }
  @media print { body { margin: 20mm 25mm; } }
</style>
</head>
<body>
<pre>${claim.text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
<script>window.onload = function() { window.print(); }</script>
</body>
</html>`);
    printWindow.document.close();
  }

  if (loading) return <p className="text-gray-500 p-4">Загрузка...</p>;
  if (!problem) return <p className="text-red-500 p-4">Проблема не найдена</p>;

  return (
    <>
      <h2 className="text-xl md:text-2xl font-bold">Проблема {problem.id}</h2>
      <p className="text-sm mb-4 md:mb-6">
        <Link href="/problems" className="text-gray-500 hover:text-gray-700">
          &larr; Назад к списку
        </Link>
      </p>

      {/* Problem info card */}
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

      {/* Description */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 mb-4 md:mb-5">
        <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">Описание</h3>
        <p className="text-sm">{problem.description}</p>
      </div>

      {/* Claim section */}
      {claim ? (
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 mb-4 md:mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-4 border-b border-gray-200">
            <h3 className="text-base font-semibold flex items-center gap-2">
              Претензия
              {claim.sent && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                  Отправлена
                </span>
              )}
            </h3>
            <div className="flex gap-2 mt-2 sm:mt-0">
              {!claim.sent && !editing && (
                <button
                  onClick={handleStartEdit}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Редактировать
                </button>
              )}
              <button
                onClick={handleExportPDF}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-semibold hover:bg-gray-50 transition-colors"
              >
                Экспорт PDF
              </button>
            </div>
          </div>

          {editing ? (
            <>
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-[400px] md:h-[500px] p-3 md:p-5 border border-blue-300 rounded-md text-xs md:text-[13px] font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 md:py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-5 py-2.5 md:py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="claim-text bg-amber-50 border border-yellow-300 rounded-md p-3 md:p-5 text-xs md:text-[13px] max-h-[400px] md:max-h-[500px] overflow-y-auto">
                {claim.text}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-5">
                {claim.sent ? (
                  <span className="text-green-600 font-semibold text-sm">
                    Претензия отправлена на {claim.recipient}
                  </span>
                ) : (
                  <>
                    <button
                      onClick={handleSend}
                      className="w-full sm:w-auto px-5 py-2.5 md:py-2 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      Отправить на {claim.recipient}
                    </button>
                    <button
                      onClick={() => handleGenerate(false)}
                      disabled={generating}
                      className="w-full sm:w-auto px-5 py-2.5 md:py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Перегенерировать
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 mb-4 md:mb-5">
          <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">
            Генерация претензии
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Выберите способ генерации претензии. AI-генерация использует Claude для создания юридически грамотного текста с учётом конкретной ситуации.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleGenerate(true)}
              disabled={generating}
              className="w-full sm:w-auto px-5 py-2.5 md:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI-генерация (Claude)
                </>
              )}
            </button>
            <button
              onClick={() => handleGenerate(false)}
              disabled={generating}
              className="w-full sm:w-auto px-5 py-2.5 md:py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              По шаблону
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
        <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">
          История
        </h3>

        {timeline.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />
            <div className="space-y-4">
              {[...timeline].reverse().map((event) => (
                <div key={event.id} className="flex gap-3 relative">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-sm z-10 flex-shrink-0">
                    {eventIcons[event.type] || "•"}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm text-gray-800">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">Пока нет событий</p>
        )}

        {/* Add comment */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Добавить комментарий..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm"
            />
            <button
              onClick={handleAddComment}
              disabled={!comment.trim()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-40"
            >
              Добавить
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
