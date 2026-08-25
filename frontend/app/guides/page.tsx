"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Guide = { id:string; title:string; icon:string; summary:string; items:string[]; action:string; source:string; sourceLabel:string };

const guides: Guide[] = [
  { id:"education", title:"Образование", icon:"🎓", summary:"Поступление, ЦВЭ, документы для обучения и официальная информация образовательных органов.", items:["ЦВЭ и регистрация", "Документы для поступления", "Справочники и результаты", "Профессиональное образование"], action:"Выберите нужную образовательную услугу и проверьте требования, сроки и официальный источник.", source:"https://egov.tj/site/tahsilot-tj?lang=ru", sourceLabel:"Официальный источник →" },
  { id:"government", title:"Госуслуги", icon:"🏛️", summary:"Государственные услуги и цифровые сервисы для граждан в одном месте.", items:["Государственные услуги", "Жизненные ситуации", "Официальные контакты", "Электронные сервисы"], action:"Найдите нужную услугу и переходите к официальному государственному ресурсу.", source:"https://egov.tj/", sourceLabel:"eGov.tj →" },
  { id:"notary", title:"Нотариальные услуги", icon:"✍️", summary:"Нотариат, государственная регистрация и юридические действия через официальные ресурсы Министерства юстиции.", items:["Государственный нотариат", "Апостилирование", "Регистрация документов", "Бесплатная юридическая помощь"], action:"Определите нужное нотариальное действие и проверьте актуальные требования перед обращением.", source:"https://egov.tj/site/adliya-tj?lang=ru", sourceLabel:"Министерство юстиции →" },
  { id:"medicine", title:"Медицина", icon:"⚕️", summary:"Государственная информация о медицинских услугах, здоровье и системе здравоохранения.", items:["Медицинские услуги", "Охрана здоровья", "Государственные программы", "Официальные контакты"], action:"Для медицинских вопросов используйте официальную информацию Министерства здравоохранения и социальной защиты населения.", source:"https://egov.tj/site/minzdrav-tjk?lang=ru", sourceLabel:"Министерство здравоохранения →" },
  { id:"social-insurance", title:"Социальное страхование", icon:"🛡️", summary:"Пенсионное обеспечение, социальная защита и обязательное и добровольное социальное страхование.", items:["Пенсионное обеспечение", "Социальная защита", "Обязательное страхование", "Добровольное социальное страхование"], action:"Выберите направление и сверяйте актуальные правила и контакты Агентства социального страхования и пенсий.", source:"https://egov.tj/site/nafaka-tj?lang=ru", sourceLabel:"Агентство социального страхования и пенсий →" }
];

export default function GuidesPage(){
  const [query,setQuery]=useState("");
  const filtered=useMemo(()=>guides.filter(g=>`${g.title} ${g.summary} ${g.items.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())),[query]);
  return <main className="subPage"><div className="subContainer">
    <nav className="subNav"><Link href="/" className="samBrand"><span className="samLogo">С</span><span>САМТ</span></Link><Link href="/">Главная</Link></nav>
    <header className="pageHeader"><span className="eyebrow">САМТ · Каталог услуг</span><h1>Найдите нужную услугу</h1><p>Пять основных направлений. Выберите категорию и получите конкретную информацию, официальный источник и следующий шаг.</p></header>
    <div className="pageSearch"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск: ЦВЭ, нотариус, медицина, пенсия…" aria-label="Поиск по категориям САМТ" /></div>
    <section className="guideGrid">{filtered.map(g=><article className="guideCard" key={g.id}><div className="guideIcon">{g.icon}</div><h2>{g.title}</h2><p>{g.summary}</p><h3>Что можно найти</h3><ul>{g.items.map(item=><li key={item}>{item}</li>)}</ul><div className="actionBox"><strong>Следующий шаг</strong><span>{g.action}</span></div><a className="sourceButton" href={g.source} target="_blank" rel="noreferrer">{g.sourceLabel}</a></article>)}</section>
    {filtered.length===0&&<div className="emptyState">Ничего не найдено. Попробуйте название услуги или одно из пяти направлений.</div>}
  </div></main>
}