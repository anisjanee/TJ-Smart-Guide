"use client";

import { FormEvent, useEffect, useState } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://tj-smart-guide.onrender.com").replace(/\/$/, "");

type Category = { id: number; name: string; slug: string; description?: string; icon?: string };
type Article = { id: number; category_id: number; category_name: string; title: string; summary: string; content: string; source_name?: string; source_url?: string; is_published: boolean };
type Stats = { categories: number; articles: number; published_articles: number; questions: number; feedback: number };

const emptyForm = { category_id: "", title: "", summary: "", content: "", source_name: "", source_url: "", is_published: true };

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function api(path: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", "X-Admin-Token": token, ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || `API ${response.status}`);
    return data;
  }

  async function loadDashboard() {
    setLoading(true);
    setMessage("");
    try {
      const [statsData, categoryData, articleData] = await Promise.all([
        api("/api/admin/stats"),
        api("/api/admin/categories"),
        api("/api/admin/articles"),
      ]);
      setStats(statsData);
      setCategories(categoryData.items || []);
      setArticles(articleData.items || []);
      setAuthorized(true);
    } catch (error) {
      setAuthorized(false);
      setMessage(error instanceof Error ? error.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = window.localStorage.getItem("tj_admin_token");
    if (saved) setToken(saved);
  }, []);

  function login(event: FormEvent) {
    event.preventDefault();
    if (!token.trim()) return;
    window.localStorage.setItem("tj_admin_token", token.trim());
    loadDashboard();
  }

  function logout() {
    window.localStorage.removeItem("tj_admin_token");
    setToken("");
    setAuthorized(false);
    setStats(null);
  }

  function editArticle(article: Article) {
    setEditingId(article.id);
    setForm({ category_id: String(article.category_id), title: article.title, summary: article.summary, content: article.content, source_name: article.source_name || "", source_url: article.source_url || "", is_published: article.is_published });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function saveArticle(event: FormEvent) {
    event.preventDefault();
    if (!form.category_id || !form.title.trim() || !form.content.trim()) return;
    setLoading(true);
    try {
      const payload = { ...form, category_id: Number(form.category_id), title: form.title.trim(), summary: form.summary.trim(), content: form.content.trim(), source_name: form.source_name.trim() || null, source_url: form.source_url.trim() || null };
      if (editingId) await api(`/api/admin/articles/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      else await api("/api/admin/articles", { method: "POST", body: JSON.stringify(payload) });
      resetForm();
      setMessage("Материал сохранён.");
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  }

  async function deleteArticle(id: number) {
    if (!window.confirm("Удалить этот материал?")) return;
    try {
      await api(`/api/admin/articles/${id}`, { method: "DELETE" });
      setArticles((items) => items.filter((item) => item.id !== id));
      setMessage("Материал удалён.");
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка удаления");
    }
  }

  if (!authorized) {
    return (
      <main className="adminPage">
        <div className="adminShell adminLogin">
          <div className="adminLogo">🇹🇯 TJ Smart Guide</div>
          <h1>Панель администратора</h1>
          <p>Управляйте базой знаний, материалами и источниками.</p>
          <form onSubmit={login} className="adminForm">
            <label>Admin token<input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Введите ADMIN_TOKEN" autoComplete="off" /></label>
            <button className="adminPrimary" disabled={loading}>{loading ? "Проверяю..." : "Войти"}</button>
          </form>
          {message && <div className="adminError">{message}</div>}
          <a className="adminBack" href="/">← Вернуться на сайт</a>
        </div>
      </main>
    );
  }

  return (
    <main className="adminPage">
      <div className="adminShell">
        <header className="adminHeader">
          <div><div className="adminLogo">🇹🇯 TJ Smart Guide</div><h1>Админ-панель</h1></div>
          <div className="adminActions"><a href="/">Сайт</a><button onClick={logout}>Выйти</button></div>
        </header>

        {stats && <section className="statsGrid">
          <div><b>{stats.articles}</b><span>Материалов</span></div>
          <div><b>{stats.published_articles}</b><span>Опубликовано</span></div>
          <div><b>{stats.questions}</b><span>Вопросов</span></div>
          <div><b>{stats.feedback}</b><span>Оценок</span></div>
        </section>}

        <section className="adminCard">
          <div className="adminCardTitle"><div><h2>{editingId ? "Редактировать материал" : "Добавить материал"}</h2><p>Добавляйте проверенную информацию и официальный источник.</p></div>{editingId && <button onClick={resetForm}>Отмена</button>}</div>
          <form onSubmit={saveArticle} className="articleForm">
            <label>Категория<select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}><option value="">Выберите категорию</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}</select></label>
            <label>Название<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Например: Как получить справку" /></label>
            <label>Краткое описание<textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></label>
            <label>Содержание<textarea rows={7} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
            <div className="formTwo"><label>Название источника<input value={form.source_name} onChange={(e) => setForm({ ...form, source_name: e.target.value })} placeholder="EGOV.TJ" /></label><label>URL источника<input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} placeholder="https://..." /></label></div>
            <label className="check"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Опубликовано</label>
            <button className="adminPrimary" disabled={loading}>{loading ? "Сохраняю..." : editingId ? "Сохранить изменения" : "Добавить материал"}</button>
          </form>
          {message && <div className="adminNotice">{message}</div>}
        </section>

        <section className="adminCard">
          <div className="adminCardTitle"><div><h2>База знаний</h2><p>{articles.length} материалов в базе.</p></div><button onClick={loadDashboard}>Обновить</button></div>
          <div className="articleList">
            {articles.map((article) => <article key={article.id} className="articleRow"><div><span className="articleBadge">{article.category_name}</span><h3>{article.title}</h3><p>{article.summary}</p><small>{article.is_published ? "🟢 опубликовано" : "⚪ черновик"}{article.source_name ? ` · ${article.source_name}` : ""}</small></div><div className="rowActions"><button onClick={() => editArticle(article)}>Изменить</button><button className="danger" onClick={() => deleteArticle(article.id)}>Удалить</button></div></article>)}
            {articles.length === 0 && <p>Материалов пока нет.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
