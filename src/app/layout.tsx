import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./sidebar";

export const metadata: Metadata = {
  title: "LegalAdviser",
  description: "Поддержка юридических консультаций",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className="h-full bg-gray-50 text-gray-800">
        <div className="flex h-full min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4 pt-18 md:p-8 md:pt-8 max-w-[1100px]">{children}</main>
        </div>
      </body>
    </html>
  );
}
