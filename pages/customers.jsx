import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

export default function CustomersPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      const res = await api.get(`/users?${params.toString()}`, token);
      const list = res.items || res.data || res || [];
      setItems(Array.isArray(list) ? list : []);
      const total = res.total ?? res.meta?.total ?? 0;
      setTotalPages(res.totalPages || res.meta?.totalPages || (total ? Math.ceil(total / 20) : 1));
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
  }, [token, page]);

  function applyFilters() {
    setPage(1);
    load();
  }

  async function toggleBlock(u) {
    const nextBlocked = !u.isBlocked;
    try {
      await api.patch(`/users/${u.id}/status`, { isBlocked: nextBlocked }, token);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <Layout title="Клиенты">
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <input
            placeholder="Поиск по имени или телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
          <button className="btn btn-sm" onClick={applyFilters}>
            Найти
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorPanel}>
          Не удалось загрузить клиентов: {error}. Проверьте, что backend поддерживает эндпоинт <code>/users</code>.
        </div>
      )}

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>Клиенты не найдены</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Заказов</th>
                <th>Регистрация</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName || u.name || "—"}</td>
                  <td>{u.phone || "—"}</td>
                  <td>{u.email || "—"}</td>
                  <td>{u.ordersCount ?? 0}</td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("ru-RU") : "—"}</td>
                  <td>
                    <span className={`badge ${u.isBlocked ? "badge-off" : "badge-on"}`}>
                      {u.isBlocked ? "Заблокирован" : "Активен"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button className="btn btn-sm" onClick={() => toggleBlock(u)}>
                        {u.isBlocked ? "Разблокировать" : "Заблокировать"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
              .map((n) => (
                <button
                  key={n}
                  className={`btn btn-sm ${n === page ? "btn-page-active" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
            <span className={styles.pageCount}>из {totalPages}</span>
            <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              →
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
