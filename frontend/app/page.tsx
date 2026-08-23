"use client";

import { FormEvent, useState } from "react";

const categories = [
  ["🪪", "Документы", "Паспорта, справки и госуслуги"],
  ["🎓", "Образование", "Школы, университеты и поступление"],
  ["💼", "Работа", "Вакансии, документы и карьера"],
  ["🏥", "Медицина", "Медучреждения и услуги"],
  ["🚗", "Транспорт", "Права, авто и маршруты"],
  ["🏢", "Бизнес", "ИП, компании и налоги"],
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      setAnswer(data.answer || "Не удалось получить ответ.");
    } catch {
      setAnswer("Не удалось подключиться к серверу. Проверьте, запущен ли backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="hero">
      <div className="container">
        <nav className="nav">
          <div className="brand"><span className="flag">🇹🇯</span> TJ Smart Guide</div>
          <div className="badge">MVP · 2026</div>
        </nav>

        <section className="heroContent">
          <div className="eyebrow">Цифровой помощник Таджикистана</div>
          <h1 className="title">Ответы на вопросы<br />о Таджикистане</h1>
          <p className="subtitle">Задайте вопрос простыми словами. TJ Smart Guide поможет разобраться в документах, образовании, работе, бизнесе и других повседневных вопросах.</p>

          <form className="search" onSubmit={ask}>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Например: как получить загранпаспорт?"
              aria-label="Ваш вопрос"
            />
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Ищу..." : "Спросить"}
            </button>
          </form>

          {answer && (
            <div style={{ marginTop: 18, padding: 22, background: "white", border: "1px solid #e5e7eb", borderRadius: 18, textAlign: "left", lineHeight: 1.6 }}>
              <strong>Ответ</strong>
              <p style={{ marginBottom: 0 }}>{answer}</p>
            </div>
          )}

          <div className="section">
            <div className="sectionTitle">Популярные категории</div>
            <div className="categories">
              {categories.map(([icon, name, description]) => (
                <button className="category" key={name} onClick={() => setQuestion(name)}>
                  <div className="categoryIcon">{icon}</div>
                  <div className="categoryName">{name}</div>
                  <div className="categoryText">{description}</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
