import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import styles from "../../styles/DataView.module.scss";

function money(n) { return new Intl.NumberFormat("ru-RU").format(n || 0) + " сум"; }

export default function ProductViewPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [product, setProduct] = useState(null);
  const [point, setPoint] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !router.query.id) return;
    Promise.all([
      api.get(`/products/${router.query.id}`, token),
      api.get(`/pickup-points/product/${router.query.id}`, token).catch(() => null),
    ]).then(([p, pp]) => {
      setProduct(p);
      setPoint(pp?.data || pp || p.pickupPoint || null);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [token, router.query.id]);

  return <Layout title="Автомобиль">
    <div className={styles.detailToolbar}><Link href="/products" className="btn">← Все автомобили</Link></div>
    {loading ? <div className={styles.loading}>Загрузка...</div> : error ? <div className={styles.errorPanel}>{error}</div> : product ? (
      <div className={styles.detailGrid}>
        <div className={styles.detailImage}>{product.image ? <img src={product.image} alt={product.name} /> : <span>NO IMAGE</span>}</div>
        <div className={styles.sectionCard}>
          <div className={styles.detailEyebrow}>CAR #{product.id}</div>
          <h2 className={styles.detailTitle}>{product.name}</h2>
          <div className={styles.detailPrice}>{money(product.price)}</div>
          <p className={styles.detailDescription}>{product.description || "Описание отсутствует."}</p>
          <div className={styles.detailFacts}>
            <div><span>Категория</span><b>{product.category?.name || "—"}</b></div>
            <div><span>Остаток</span><b>{product.stock ?? 0}</b></div>
            <div><span>Статус</span><b>{product.isActive ? "Активен" : "Скрыт"}</b></div>
          </div>
        </div>
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>Точка выдачи</h3>
          {point ? <div className={styles.pickupCard}><strong>{point.name || `Точка #${point.id}`}</strong><span>{point.address || point.location || "Адрес не указан"}</span>{point.phone && <span>{point.phone}</span>}</div> : <div className={styles.emptyState}>Точка выдачи не назначена</div>}
        </div>
      </div>
    ) : null}
  </Layout>;
}
