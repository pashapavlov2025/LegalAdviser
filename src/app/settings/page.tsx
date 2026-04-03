"use client";

export default function SettingsPage() {
  return (
    <>
      <h2 className="text-2xl font-bold">Настройки подключения к 1С</h2>
      <p className="text-sm text-gray-500 mb-6">
        Параметры подключения к 1С:Предприятие через REST/OData API
      </p>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-5">
        <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">
          Подключение к 1С:Предприятие
        </h3>
        <div className="space-y-4">
          <Field label="URL сервера 1С" defaultValue="http://localhost:8080/1c/odata/standard.odata" />
          <Field label="Имя пользователя" defaultValue="Администратор" />
          <Field label="Пароль" defaultValue="demo1234" type="password" />
          <Field label="Информационная база" defaultValue="LegalBase" />
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => alert("В прототипе используются демо-данные. В production-версии здесь будет реальное подключение к 1С.")}
            className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Проверить подключение
          </button>
          <button
            onClick={() => alert("Настройки сохранены (демо)")}
            className="px-5 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Сохранить
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-base font-semibold pb-3 mb-4 border-b border-gray-200">
          Настройки отправки претензий
        </h3>
        <div className="space-y-4">
          <Field label="SMTP-сервер" defaultValue="smtp.company.ru" />
          <Field label="Порт" defaultValue="587" />
          <Field label="Email отправителя" defaultValue="legal@company.ru" type="email" />
        </div>
        <div className="mt-6">
          <button
            onClick={() => alert("Настройки сохранены (демо)")}
            className="px-5 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Сохранить
          </button>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
      />
    </div>
  );
}
