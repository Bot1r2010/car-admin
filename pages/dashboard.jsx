import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

function formatSum(n) {
  if (n == null) return "0";
  return new Intl.NumberFormat("ru-RU").format(n) + " сум";
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickupCount, setPickupCount] = useState(null);
  const [ordersCount, setOrdersCount] = useState(null);
  const [customersCount, setCustomersCount] = useState(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.get("/dashboard/stats", token),
      api.get("/dashboard/category-stats", token),
      api.get("/pickup-points?limit=100", token).catch(() => null),
      api.get("/orders?limit=1", token).catch(() => null),
      api.get("/users?limit=1", token).catch(() => null),
    ])
      .then(([s, c, p, o, u]) => {
        setStats(s);
        setCategoryStats(c);
        setPickupCount(p ? (p.items || p.data || p || []).length : null);
        setOrdersCount(o ? o.total ?? o.meta?.total ?? (o.items || o.data || []).length : null);
        setCustomersCount(u ? u.total ?? u.meta?.total ?? (u.items || u.data || []).length : null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <Layout title="Главная">
      {loading || !stats ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Всего автомобилей</div>
              <div className={styles.statValue}>{stats.products.total}</div>
              <div className={styles.statSub}>
                {stats.products.active} активных · {stats.products.inactive} скрытых
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Нет в наличии</div>
              <div className={styles.statValue}>{stats.products.outOfStock}</div>
              <div className={styles.statSub}>{stats.products.lowStock} с низким остатком</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Категории</div>
              <div className={styles.statValue}>{stats.categories.total}</div>
              <div className={styles.statSub}>
                {stats.categories.active} активных · {stats.categories.empty} пустых
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Точки выдачи</div>
              <div className={styles.statValue}>{pickupCount ?? "—"}</div>
              <div className={styles.statSub}>управление пунктами выдачи</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Заказы</div>
              <div className={styles.statValue}>{ordersCount ?? "—"}</div>
              <div className={styles.statSub}>всего оформлено</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Клиенты</div>
              <div className={styles.statValue}>{customersCount ?? "—"}</div>
              <div className={styles.statSub}>зарегистрировано</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Общая стоимость</div>
              <div className={styles.statValue}>{formatSum(stats.stock.totalValue)}</div>
              <div className={styles.statSub}>
                средняя цена {formatSum(stats.stock.averagePrice)}
              </div>
            </div>
          </div>

          <div className={styles.sectionsRow}>
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>Статистика по категориям</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Категория</th>
                    <th>Всего</th>
                    <th>Активных</th>
                    <th>Штук</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.map((c) => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.productsCount}</td>
                      <td>{c.activeCount}</td>
                      <td>{c.totalStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>Последние добавленные</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.latestProducts?.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{formatSum(p.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
