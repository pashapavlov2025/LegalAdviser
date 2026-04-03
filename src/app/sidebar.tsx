"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Проблемы из 1С", icon: "☰" },
    { href: "/settings", label: "Настройки 1С", icon: "⚙" },
  ];

  const nav = (
    <>
      <nav className="mt-2">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/" || pathname.startsWith("/problem")
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-6 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="mr-2">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto mx-4 mb-6 p-3 rounded-md bg-green-500/15 text-green-300 text-xs">
        <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1.5" />
        1С: подключено (демо)
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#1a365d] text-white flex items-center px-4 h-14">
        <button onClick={() => setOpen(!open)} className="p-2 -ml-2 mr-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <span className="font-bold text-lg">LegalAdviser</span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 w-[260px] bg-[#1a365d] text-white flex flex-col transform transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h1 className="text-xl font-bold px-6 py-5 border-b border-white/10">
          LegalAdviser
        </h1>
        {nav}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[260px] bg-[#1a365d] text-white flex-shrink-0 flex-col">
        <h1 className="text-xl font-bold px-6 py-5 border-b border-white/10">
          LegalAdviser
        </h1>
        {nav}
      </aside>
    </>
  );
}
