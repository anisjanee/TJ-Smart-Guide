import Link from "next/link";

const items = [
  ["💼", "Поиск работы", "Навигация по вакансиям, требованиям и официальным ресурсам занятости."],
  ["🧑‍💻", "IT и digital", "Отдельный раздел для разработчиков, дизайнеров, аналитиков и начинающих специалистов."],
  ["📄", "Трудовые вопросы", "Проверенная справочная информация о документах и трудовых процедурах."],
  ["🌍", "Удалённая работа", "Подборка направлений и навыков для работы с международными командами."],
];

export default function JobsPage() {
  return <main className="subPage"><div className="subContainer"><nav className="subNav"><Link href="/">🇹🇯 TJ Smart Guide</Link><Link href="/">Главная</Link></nav><header className="pageHeader"><span className="eyebrow">Работа</span><h1>Работа и карьера</h1><p>Помогаем понять, где искать работу, какие навыки развивать и какие документы могут понадобиться.</p></header><section className="featureGrid">{items.map(([icon,title,text]) => <article className="featureCard" key={title}><div className="guideIcon">{icon}</div><h2>{title}</h2><p>{text}</p><Link href={`/?q=${encodeURIComponent(title)}`}>Спросить TJ Smart Guide →</Link></article>)}</section></div></main>;
}
