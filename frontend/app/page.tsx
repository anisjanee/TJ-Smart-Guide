"use client";

import { FormEvent, useEffect, useState } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://tj-smart-guide.onrender.com").replace(/\/$/, "");

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
};

type Source = { title: string; name: string; url: string };
type SearchItem = {
  id: number;
  title: string;
  summary: string;
  category_name: string;
  source_name?: string;
  source_url?: string;
};

const fallbackCategories: Category[] = [
  { id: 1, slug: "documents", icon: "🪪", name: "Документы", description: "Паспорта, справки и госуслуги" },
  { id: 2, slug: "education", icon: "🎓", name: "Образование", description: "Школы, университеты и поступление" },
  { id: 3, slug: "jobs", icon: "💼", name: "Работа", description: "Вакансии, документы и карьера" },
  { id: 4, slug: "government", icon: "🏛️", name: "Госуслуги", description: "Государственные сервисы и источники" },
  { id: 5, slug: "business", icon: "🏢", name: "Бизнес", description: "ИП, компании и налоги" },
  { id: 6, slug: "life", icon: "🏠", name: "Жизнь", description: "Полезная информация каждый день" },
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [questionLogId, setQuestionLogId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [knowledgeQuery, setKnowledgeQuery] = useState("");
  const [knowledge, setKnowledge] = useState<SearchItem[]>([]);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => data.items?.length && setCategories(data.items))
      .catch(() => undefined);
  }, []);

  async function ask(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");
    setSources([]);
    setFeedbackSent(false);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) throw new Error(`API ${response.status}`);

      const data = await response.json();
      setAnswer(data.answer || "Не удалось получить ответ.");
      setSources(data.sources || []);
      setQuestionLogId(data.question_log_id || null);
    } catch {
      setAnswer("Не удалось подключиться к TJ Smart Guide API. Проверьте настройки Render.");
    } finally {
      setLoading(false);
    }
  }

  async function searchKnowledge(event: FormEvent) {
    event.preventDefault();
    if (knowledgeQuery.trim().length < 2) return;

    setKnowledgeLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(knowledgeQuery.trim())}`);
      const data = await response.json();
      setKnowledge(data.items || []);
    } finally {
      setKnowledgeLoading(false);
    }
  }

  async function sendFeedback(rating: number) {
    if (!questionLogId) return;
    const response = await fetch(`${API_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_log_id: questionLogId, rating }),
    });
    if (response.ok) setFeedbackSent(true);
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
          <p className="subtitle">Задайте вопрос простыми словами. TJ Smart Guide помогает разобраться в документах, образовании, работе, бизнесе и других повседневных вопросах.</p>

          <form className="search" onSubmit={ask}>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Например: где искать официальную информацию о госуслугах?"
              aria-label="Ваш вопрос"
            />
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Ищу..." : "Спросить"}
            </button>
          </form>

          {answer && (
            <div className="answerCard">
              <strong>Ответ</strong>
              <p>{answer}</p>

              {sources.length > 0 && (
                <div className="sources">
                  <div className="sourcesTitle">Источники</div>
                  {sources.slice(0, 3).map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="sourceLink">
                      {source.name} · {source.title}
                    </a>
                  ))}
                </div>
              )}

              {questionLogId && !feedbackSent && (
                <div className="feedback">
                  <span>Полезен ответ?</span>
                  <button type="button" onClick={() => sendFeedback(5)}>👍 Да</button>
                  <button type="button" onClick={() => sendFeedback(2)}>👎 Нет</button>
                </div>
              )}
              {feedbackSent && <div className="feedbackDone">Спасибо за оценку.</div>}
            </div>
          )}

          <div className="section">
            <div className="sectionTitle">Популярные категории</div>
            <div className="categories">
              {categories.map((category) => (
                <button className="category" key={category.slug} type="button" onClick={() => setQuestion(category.name)}>
                  <div className="categoryIcon">{category.icon || "📌"}</div>
                  <div className="categoryName">{category.name}</div>
                  <div className="categoryText">{category.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="section knowledgeSection">
            <div className="sectionTitle">База знаний</div>
            <p className="sectionHint">Поиск по проверенным материалам, которые подключены к TJ Smart Guide.</p>
            <form className="knowledgeSearch" onSubmit={searchKnowledge}>
              <input
                value={knowledgeQuery}
                onChange={(event) => setKnowledgeQuery(event.target.value)}
                placeholder="Например: образование"
                aria-label="Поиск по базе знаний"
              />
              <button className="secondary" type="submit" disabled={knowledgeLoading}>
                {knowledgeLoading ? "Поиск..." : "Найти"}
              </button>
            </form>

            {knowledge.length > 0 && (
              <div className="knowledgeList">
                {knowledge.map((item) => (
                  <article className="knowledgeCard" key={item.id}>
                    <div className="knowledgeCategory">{item.category_name}</div>
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    {item.source_url && (
                      <a href={item.source_url} target="_blank" rel="noreferrer">Открыть источник →</a>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
