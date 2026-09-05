import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import styles from "../../styles/DataView.module.scss";

const STATUS_LABELS = {
  pending: "Новый",
  processing: "В обработке",
  completed: "Завершён",
  cancelled: "Отменён",
};

function money(n) {
  return new Intl.NumberFormat("ru-RU").format(n || 0) + " сум";
}

export default function OrderViewPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !router.query.id) return;
    api
      .get(`/orders/${router.query.id}`, token)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, router.query.id]);

  const items = order?.items || order?.products || [];

  return (
    <Layout title="Заказ">
      <div className={styles.detailToolbar}>
        <Link href="/orders" className="btn">
          ← Все заказы
        </Link>
      </div>
      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : error ? (
        <div className={styles.errorPanel}>{error}</div>
      ) : order ? (
        <div className={styles.detailGrid}>
          <div className={styles.sectionCard}>
            <div className={styles.detailEyebrow}>ЗАКАЗ #{order.id}</div>
            <h2 className={styles.detailTitle}>
              {order.customerName || order.customer?.fullName || order.user?.fullName || "Клиент"}
            </h2>
            <span className={`badge ${order.status === "completed" ? "badge-on" : order.status === "cancelled" ? "badge-off" : "badge-progress"}`}>
              {STATUS_LABELS[order.status] || order.status || "—"}
            </span>
            <div className={styles.detailFacts}>
              <div>
                <span>Телефон</span>
                <b>{order.phone || order.customer?.phone || order.user?.phone || "—"}</b>
              </div>
              <div>
                <span>Дата</span>
                <b>{order.createdAt ? new Date(order.createdAt).toLocaleString("ru-RU") : "—"}</b>
              </div>
              <div>
                <span>Сумма</span>
                <b>{money(order.total ?? order.totalPrice)}</b>
              </div>
            </div>
          </div>

          <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>Точка выдачи</h3>
            {order.pickupPoint ? (
              <div className={styles.pickupCard}>
                <strong>{order.pickupPoint.name || `Точка #${order.pickupPoint.id}`}</strong>
                <span>{order.pickupPoint.address || "Адрес не указан"}</span>
                {order.pickupPoint.phone && <span>{order.pickupPoint.phone}</span>}
              </div>
            ) : (
              <div className={styles.emptyState}>Точка выдачи не назначена</div>
            )}
          </div>

          <div className={styles.sectionCard} style={{ gridColumn: "1 / -1" }}>
            <h3 className={styles.sectionTitle}>Состав заказа</h3>
            {items.length === 0 ? (
              <div className={styles.emptyState}>Нет данных о товарах</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Автомобиль</th>
                    <th>Кол-во</th>
                    <th>Цена</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={it.id || i}>
                      <td>{it.name || it.product?.name || "—"}</td>
                      <td>{it.quantity ?? 1}</td>
                      <td>{money(it.price)}</td>
                      <td>{money((it.price || 0) * (it.quantity ?? 1))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
