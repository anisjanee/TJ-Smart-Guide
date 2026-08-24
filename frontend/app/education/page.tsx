import Link from "next/link";

const items = [
  ["🎓", "Поступление", "Пошаговая подготовка к поступлению: направление, требования, документы и сроки."],
  ["🏫", "Школы", "Полезная навигация по школьному образованию и официальным материалам."],
  ["📚", "Университеты", "Сравнение информации об учебных заведениях и специальностях по проверенным источникам."],
  ["💰", "Стипендии и гранты", "Раздел для возможностей финансирования обучения и международных программ."],
];

export default function EducationPage() {
  return <main className="subPage"><div className="subContainer"><nav className="subNav"><Link href="/">🇹🇯 TJ Smart Guide</Link><Link href="/">Главная</Link></nav><header className="pageHeader"><span className="eyebrow">Образование</span><h1>Образование в Таджикистане</h1><p>Один раздел для школьников, студентов и родителей. Важные требования должны подтверждаться официальным источником.</p></header><section className="featureGrid">{items.map(([icon,title,text]) => <article className="featureCard" key={title}><div className="guideIcon">{icon}</div><h2>{title}</h2><p>{text}</p><Link href={`/?q=${encodeURIComponent(title)}`}>Найти информацию →</Link></article>)}</section></div></main>;
}
