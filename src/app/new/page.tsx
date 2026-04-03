"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Counterparty,
  ProblemType,
  PROBLEM_TYPE_LABELS,
} from "@/lib/models";

export default function NewProblemPage() {
  const router = useRouter();
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [selectedCp, setSelectedCp] = useState("");
  const [newCp, setNewCp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [cpName, setCpName] = useState("");
  const [cpInn, setCpInn] = useState("");
  const [cpAddress, setCpAddress] = useState("");
  const [cpEmail, setCpEmail] = useState("");

  const [problemType, setProblemType] = useState<ProblemType>(ProblemType.LATE_DELIVERY);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [contractDate, setContractDate] = useState("");

  useEffect(() => {
    fetch("/api/counterparties")
      .then((r) => r.json())
      .then(setCounterparties);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    let counterparty: Counterparty;
    if (newCp) {
      counterparty = {
        id: "__new__",
        name: cpName,
        inn: cpInn,
        address: cpAddress,
        contactEmail: cpEmail,
      };
    } else {
      const found = counterparties.find((c) => c.id === selectedCp);
      if (!found) return;
      counterparty = found;
    }

    const res = await fetch("/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        counterparty,
        problemType,
        description,
        amount: Number(amount) || 0,
        contractNumber,
        contractDate,
      }),
    });

    if (res.ok) {
      const problem = await res.json();
      router.push(`/problem/${problem.id}`);
    }
    setSubmitting(false);
  }

  return (
    <>
      <h2 className="text-xl md:text-2xl font-bold">Новая проблема</h2>
      <p className="text-sm text-gray-500 mb-4 md:mb-6">
        Создание проблемы вручную для формирования претензии
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
        {/* Counterparty selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">
            Контрагент
          </h3>

          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="cpMode"
                checked={!newCp}
                onChange={() => setNewCp(false)}
                className="accent-blue-600"
              />
              Выбрать из списка
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="cpMode"
                checked={newCp}
                onChange={() => setNewCp(true)}
                className="accent-blue-600"
              />
              Новый контрагент
            </label>
          </div>

          {!newCp ? (
            <select
              value={selectedCp}
              onChange={(e) => setSelectedCp(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm bg-white"
            >
              <option value="">Выберите контрагента...</option>
              {counterparties.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (ИНН {c.inn})
                </option>
              ))}
            </select>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Наименование" value={cpName} onChange={setCpName} required placeholder='ООО "Компания"' />
              <Field label="ИНН" value={cpInn} onChange={setCpInn} required placeholder="7700000000" />
              <Field label="Адрес" value={cpAddress} onChange={setCpAddress} required placeholder="г. Москва, ул. ..." className="md:col-span-2" />
              <Field label="Email" value={cpEmail} onChange={setCpEmail} required placeholder="info@company.ru" type="email" className="md:col-span-2" />
            </div>
          )}
        </div>

        {/* Problem details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
          <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">
            Суть проблемы
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Тип проблемы</label>
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value as ProblemType)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm bg-white"
              >
                {Object.entries(PROBLEM_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Описание проблемы</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                placeholder="Подробно опишите суть проблемы, укажите факты и даты..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Сумма (руб.)" value={amount} onChange={setAmount} placeholder="0" type="number" />
              <Field label="Номер договора" value={contractNumber} onChange={setContractNumber} required placeholder="ДОГ-2025/001" />
              <Field label="Дата договора" value={contractDate} onChange={setContractDate} required type="date" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Создание..." : "Создать проблему"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-6 py-2.5 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm"
      />
    </div>
  );
}
