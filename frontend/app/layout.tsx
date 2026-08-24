import type { Metadata } from "next";
import "./globals.css";
import "./mobile.css";
import "./premium.css";

export const metadata: Metadata = {
  title: "TJ Smart Guide | Умный помощник по Таджикистану",
  description: "Проверенная информация о госуслугах, образовании, работе, бизнесе и повседневной жизни в Таджикистане.",
  themeColor: "#050816",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
