"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Проблемы из 1С", icon: "☰" },
    { href: "/settings", label: "Настройки 1С", icon: "⚙" },
  ];

  return (
    <aside className="w-[260px] bg-[#1a365d] text-white flex-shrink-0 flex flex-col">
      <h1 className="text-xl font-bold px-6 py-5 border-b border-white/10">
        LegalAdviser
      </h1>
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
    </aside>
  );
}
