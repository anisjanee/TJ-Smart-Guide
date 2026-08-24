"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const guides = [
  { id: "passport", title: "Паспорт", icon: "🪪", steps: ["Проверьте требования на официальном государственном ресурсе.", "Подготовьте необходимые документы.", "Уточните адрес и режим работы соответствующего учреждения.", "Перед визитом проверьте актуальные требования и возможные сборы."] },
  { id: "certificate", title: "Справка или документ", icon: "📄", steps: ["Определите точное название документа.", "Проверьте, какой государственный орган его выдаёт.", "Подготовьте документы и заявление, если они требуются.", "Сохраните официальный источник и проверьте срок действия документа."] },
  { id: "registration", title: "Регистрация", icon: "📝", steps: ["Определите, что именно нужно зарегистрировать.", "Найдите официальный портал или учреждение.", "Проверьте список документов и требования.", "После подачи сохраните номер заявления или подтверждение."] },
];

export default function GuidesPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => guides.filter((g) => g.title.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <main className="subPage"><div className="subContainer">
      <nav className="subNav"><Link href="/">🇹🇯 TJ Smart Guide</Link><Link href="/">Главная</Link></nav>
      <header className="pageHeader"><span className="eyebrow">Госуслуги</span><h1>Как получить нужный документ?</h1><p>Пошаговые инструкции без выдуманных сроков и цен. Для важных действий всегда проверяйте официальный источник.</p></header>
      <div className="pageSearch"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти документ..." aria-label="Поиск документа" /></div>
      <section className="guideGrid">{filtered.map((guide) => <article className="guideCard" key={guide.id}><div className="guideIcon">{guide.icon}</div><h2>{guide.title}</h2><ol>{guide.steps.map((step, i) => <li key={i}>{step}</li>)}</ol><div className="verified">✓ Проверяйте актуальность на официальном источнике</div></article>)}</section>
    </div></main>
  );
}
