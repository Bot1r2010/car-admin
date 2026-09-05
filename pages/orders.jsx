import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

const STATUS_LABELS = {
  pending: "Новый",
  processing: "В обработке",
  completed: "Завершён",
  cancelled: "Отменён",
};

const STATUS_BADGE = {
  pending: "badge-pending",
  processing: "badge-progress",
  completed: "badge-on",
  cancelled: "badge-off",
};

function formatSum(n) {
  return new Intl.NumberFormat("ru-RU").format(n || 0) + " сум";
}

export default function OrdersPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      const res = await api.get(`/orders?${params.toString()}`, token);
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
  }, [token, page, status]);

  function applyFilters() {
    setPage(1);
    load();
  }

  async function changeStatus(order, next) {
    try {
      await api.patch(`/orders/${order.id}/status`, { status: next }, token);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <Layout title="Заказы">
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <input
            placeholder="Поиск по заказу, клиенту, телефону..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Любой статус</option>
            <option value="pending">Новый</option>
            <option value="processing">В обработке</option>
            <option value="completed">Завершён</option>
            <option value="cancelled">Отменён</option>
          </select>
          <button className="btn btn-sm" onClick={applyFilters}>
            Применить
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorPanel}>
          Не удалось загрузить заказы: {error}. Проверьте, что backend поддерживает эндпоинт{" "}
          <code>/orders</code>.
        </div>
      )}

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>Заказы не найдены</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Товаров</th>
                <th>Сумма</th>
                <th>Точка выдачи</th>
                <th>Статус</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/orders/${o.id}`} className={styles.productLink}>
                      #{o.id}
                    </Link>
                  </td>
                  <td>{o.customerName || o.customer?.fullName || o.user?.fullName || "—"}</td>
                  <td>{o.phone || o.customer?.phone || o.user?.phone || "—"}</td>
                  <td>{o.itemsCount ?? o.items?.length ?? "—"}</td>
                  <td>{formatSum(o.total ?? o.totalPrice)}</td>
                  <td>{o.pickupPoint?.name || o.pickupPoint?.address || "—"}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[o.status] || "badge-accent"}`}>
                      {STATUS_LABELS[o.status] || o.status || "—"}
                    </span>
                  </td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("ru-RU") : "—"}</td>
                  <td>
                    <div className={styles.rowActions}>
                      {o.status !== "processing" && o.status !== "completed" && o.status !== "cancelled" && (
                        <button className="btn btn-sm" onClick={() => changeStatus(o, "processing")}>
                          В обработку
                        </button>
                      )}
                      {o.status !== "completed" && o.status !== "cancelled" && (
                        <button className="btn btn-sm" onClick={() => changeStatus(o, "completed")}>
                          Завершить
                        </button>
                      )}
                      {o.status !== "cancelled" && o.status !== "completed" && (
                        <button className="btn btn-sm btn-danger" onClick={() => changeStatus(o, "cancelled")}>
                          Отменить
                        </button>
                      )}
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
