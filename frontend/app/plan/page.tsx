"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

const scenarios = {
  education: { title: "Поступление", icon: "🎓", steps: ["Определить направление и уровень обучения", "Проверить требования выбранного учебного заведения", "Собрать документы и проверить сроки подачи", "Подать заявление через официальный канал", "Сохранить подтверждение и отслеживать результат"] },
  document: { title: "Получение документа", icon: "📄", steps: ["Уточнить точное название документа", "Определить орган, который его выдаёт", "Проверить актуальный список документов", "Уточнить способ подачи и адрес", "Сохранить подтверждение обращения"] },
  job: { title: "Поиск работы", icon: "💼", steps: ["Определить желаемую должность", "Проверить требования и пробелы в навыках", "Подготовить резюме и портфолио", "Выбрать подходящие вакансии", "Отслеживать отклики и улучшать резюме"] },
};

export default function PlanPage() {
  const [selected, setSelected] = useState<keyof typeof scenarios>("education");
  const [custom, setCustom] = useState("");
  const scenario = useMemo(() => scenarios[selected], [selected]);
  return <main className="subPage"><div className="subContainer"><nav className="subNav"><Link href="/">🇹🇯 TJ Smart Guide</Link><Link href="/">Главная</Link></nav><header className="pageHeader"><span className="eyebrow">Умный план</span><h1>Что мне делать?</h1><p>Опишите ситуацию, а TJ Smart Guide поможет превратить её в последовательный план. Для государственных действий каждый шаг должен подтверждаться официальным источником.</p></header><div className="planChooser">{(Object.keys(scenarios) as Array<keyof typeof scenarios>).map(key => <button className={selected === key ? "planChoice active" : "planChoice"} key={key} onClick={() => setSelected(key)}>{scenarios[key].icon} {scenarios[key].title}</button>)}</div><div className="planInput"><input maxLength={300} value={custom} onChange={e => setCustom(e.target.value)} placeholder="Например: хочу поступить в университет после школы"/><span>{custom.length}/300</span></div><section className="planCard"><div className="guideIcon">{scenario.icon}</div><h2>{scenario.title}: пошаговый план</h2><ol>{scenario.steps.map((step, i) => <li key={step}><b>{i + 1}</b><span>{step}</span></li>)}</ol><div className="verified">План является навигационной подсказкой. Перед действием проверяйте требования на официальном источнике.</div></section></div></main>;
}
