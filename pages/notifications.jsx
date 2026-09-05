import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

const EMPTY_FORM = { title: "", message: "", audience: "all" };

export default function NotificationsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/notifications?limit=100", token);
      const list = res.items || res.data || res || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleSend(e) {
    e.preventDefault();
    setSendError("");
    setSending(true);
    try {
      await api.post("/notifications", form, token);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout title="Уведомления">
      <div className={styles.sectionsRow}>
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>История уведомлений</h3>
          {error && (
            <div className={styles.errorPanel}>
              Не удалось загрузить историю: {error}. Проверьте эндпоинт <code>/notifications</code>.
            </div>
          )}
          {loading ? (
            <div className={styles.loading}>Загрузка...</div>
          ) : items.length === 0 ? (
            <div className={styles.emptyState}>Уведомления ещё не отправлялись</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Заголовок</th>
                  <th>Аудитория</th>
                  <th>Отправлено</th>
                </tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n.id}>
                    <td>{n.title}</td>
                    <td>{n.audience === "all" ? "Все клиенты" : n.audience || "—"}</td>
                    <td>{n.createdAt ? new Date(n.createdAt).toLocaleString("ru-RU") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Новое уведомление</h3>
          <form onSubmit={handleSend}>
            <div className="field">
              <label>Заголовок</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                minLength={2}
              />
            </div>
            <div className="field">
              <label>Текст сообщения</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Аудитория</label>
              <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                <option value="all">Все клиенты</option>
                <option value="active">Только активные</option>
              </select>
            </div>
            {sendError && <p className="error-text">{sendError}</p>}
            <button type="submit" className="btn btn-primary" disabled={sending} style={{ width: "100%" }}>
              {sending ? "Отправка..." : "Отправить"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
