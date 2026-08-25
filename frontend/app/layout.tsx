import type { Metadata } from "next";
import "./globals.css";
import "./mobile.css";
import "./theme.css";

export const metadata: Metadata = {
  title: "САМТ | Цифровой навигатор Таджикистана",
  description: "Единый цифровой навигатор по образованию, государственным, нотариальным и медицинским услугам и социальному страхованию в Таджикистане.",
  themeColor: "#f6f8fc",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru" data-theme="light"><body>{children}</body></html>;
}
