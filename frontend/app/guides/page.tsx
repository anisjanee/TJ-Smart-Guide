"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Guide = {
  id: string;
  title: string;
  icon: string;
  summary: string;
  whatYouGet: string[];
  documents: string[];
  action: string;
  source: string;
  sourceLabel: string;
};

const guides: Guide[] = [
  { id: "passport", title: "Паспорт", icon: "🪪", summary: "Собранная карточка по обращению за паспортом: что подготовить, куда обращаться и где проверить актуальные требования.", whatYouGet: ["Чек-лист подготовки", "Подсказки по месту обращения", "Официальный источник"], documents: ["Документ, удостоверяющий личность, если он уже есть", "Документы, предусмотренные конкретной процедурой", "Дополнительные документы только если их требует выбранная услуга"], action: "Перед обращением сверяйте текущие требования, срок и размер сбора на государственном портале.", source: "https://egov.tj/", sourceLabel: "Официальный eGov.tj →" },
  { id: "birth", title: "Свидетельство о рождении", icon: "👶", summary: "Собранная точка входа для регистрации рождения и проверки требований органов ЗАГС.", whatYouGet: ["Что подготовить", "Какие сведения понадобятся", "Официальный источник и контакты"], documents: ["Документы родителей/заявителя", "Сведения о ребёнке", "Документы, подтверждающие обстоятельства регистрации, если они требуются"], action: "Проверьте действующие требования и форму обращения на официальном государственном ресурсе.", source: "https://egov.tj/", sourceLabel: "Официальный eGov.tj →" },
  { id: "education-cve", title: "Поступление через ЦВЭ", icon: "🎓", summary: "Актуальная навигация по ЦВЭ-2026: регистрация, документы, личный кабинет и результаты.", whatYouGet: ["Документы для регистрации", "Периоды регистрации", "Личный кабинет", "Получение результатов"], documents: ["Документ, подтверждающий личность", "Документ об образовании или справка об обучении", "Подтверждение оплаты, если услуга платная", "Документы на льготы, если они есть"], action: "Для ЦВЭ-2026 точные периоды и требования публикует Национальный центр тестирования.", source: "https://ntc.tj/ru/abiturientu/spravochnik-2026.html", sourceLabel: "Справочник абитуриента НЦТ-2026 →" },
  { id: "job", title: "Поиск работы", icon: "💼", summary: "Готовая точка входа к национальной базе вакансий и государственным службам занятости.", whatYouGet: ["Вакансии на kor.tj", "Контакты служб занятости", "Профессиональное обучение"], documents: ["Резюме", "Документы об образовании и квалификации при наличии", "Документ, удостоверяющий личность, когда он нужен для конкретной услуги"], action: "Начните с национальной базы вакансий или выберите территориальное подразделение службы занятости.", source: "https://www.kor.tj/", sourceLabel: "Национальная база вакансий kor.tj →" },
  { id: "business", title: "Начать бизнес", icon: "🏢", summary: "Подготовка к регистрации деятельности, официальные сервисы и базовая навигация по бизнес-вопросам.", whatYouGet: ["Чек-лист подготовки", "Официальные сервисы", "Навигация по налоговым вопросам"], documents: ["Документ, удостоверяющий личность", "Сведения для регистрации выбранной формы деятельности", "Дополнительные документы по конкретному виду деятельности"], action: "Определите форму деятельности и проверяйте действующие требования на государственных ресурсах.", source: "https://egov.tj/", sourceLabel: "Официальный eGov.tj →" },
  { id: "services", title: "Госуслуги", icon: "🏛️", summary: "Единая точка входа к государственным сервисам вместо набора случайных инструкций из интернета.", whatYouGet: ["Поиск нужной услуги", "Официальные контакты", "Государственные источники"], documents: ["Зависит от выбранной услуги", "Перед обращением сервис показывает известные требования"], action: "Выберите конкретную услугу, чтобы получить её данные и официальный источник.", source: "https://egov.tj/", sourceLabel: "eGov.tj →" },
];

export default function GuidesPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => guides.filter((g) => `${g.title} ${g.summary} ${g.whatYouGet.join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <main className="subPage"><div className="subContainer">
      <nav className="subNav"><Link href="/">🇹🇯 TJ Smart Guide</Link><Link href="/">Главная</Link></nav>
      <header className="pageHeader"><span className="eyebrow">Госуслуги</span><h1>Получите нужные данные в одном месте</h1><p>Здесь пользователь не должен искать инструкцию о том, где искать информацию. Выберите услугу и сразу получите чек-лист, полезные сведения и официальный источник.</p></header>
      <div className="pageSearch"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Например: паспорт, ЦВЭ, работа..." aria-label="Поиск услуги" /></div>
      <section className="guideGrid">{filtered.map((guide) => <article className="guideCard" key={guide.id}>
        <div className="guideIcon">{guide.icon}</div><h2>{guide.title}</h2><p>{guide.summary}</p>
        <h3>Что здесь есть</h3><ul>{guide.whatYouGet.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3>Подготовьте</h3><ul>{guide.documents.map((item) => <li key={item}>{item}</li>)}</ul>
        <div className="actionBox"><strong>Что делать сейчас</strong><span>{guide.action}</span></div>
        <a className="sourceButton" href={guide.source} target="_blank" rel="noreferrer">{guide.sourceLabel}</a>
      </article>)}</section>
      {filtered.length === 0 && <div className="emptyState">По этому запросу пока нет готового материала. Попробуйте другое название услуги.</div>}
    </div></main>
  );
}
