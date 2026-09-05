import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

function Stars({ value = 0 }) {
  return (
    <span style={{ color: "#ffb648", letterSpacing: 1 }}>
      {"★".repeat(Math.round(value))}
      <span style={{ opacity: 0.25 }}>{"★".repeat(5 - Math.round(value))}</span>
    </span>
  );
}

export default function ReviewsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (status) params.set("status", status);
      const res = await api.get(`/reviews?${params.toString()}`, token);
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
  }, [token, status]);

  async function setApproved(r, isApproved) {
    try {
      await api.patch(`/reviews/${r.id}/status`, { isApproved }, token);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function remove(r) {
    if (!confirm("Удалить отзыв?")) return;
    try {
      await api.del(`/reviews/${r.id}`, token);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <Layout title="Отзывы">
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Все отзывы</option>
            <option value="pending">На модерации</option>
            <option value="approved">Одобренные</option>
            <option value="hidden">Скрытые</option>
          </select>
        </div>
      </div>

      {error && (
        <div className={styles.errorPanel}>
          Не удалось загрузить отзывы: {error}. Проверьте, что backend поддерживает эндпоинт <code>/reviews</code>.
        </div>
      )}

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>Отзывы не найдены</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Автомобиль</th>
                <th>Автор</th>
                <th>Оценка</th>
                <th>Комментарий</th>
                <th>Дата</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.product?.name || r.productName || "—"}</td>
                  <td>{r.author?.fullName || r.user?.fullName || r.authorName || "—"}</td>
                  <td>
                    <Stars value={r.rating} />
                  </td>
                  <td style={{ whiteSpace: "normal", maxWidth: 280 }}>{r.comment || r.text || "—"}</td>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("ru-RU") : "—"}</td>
                  <td>
                    <span className={`badge ${r.isApproved ? "badge-on" : "badge-pending"}`}>
                      {r.isApproved ? "Одобрен" : "На модерации"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      {!r.isApproved && (
                        <button className="btn btn-sm" onClick={() => setApproved(r, true)}>
                          Одобрить
                        </button>
                      )}
                      {r.isApproved && (
                        <button className="btn btn-sm" onClick={() => setApproved(r, false)}>
                          Скрыть
                        </button>
                      )}
                      <button className="btn btn-sm btn-danger" onClick={() => remove(r)}>
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
