import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: 0,
  image: "",
  categoryId: "",
};

function formatSum(n) {
  return new Intl.NumberFormat("ru-RU").format(n || 0) + " сум";
}

export default function ProductsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  async function loadCategories() {
    const res = await api.get("/categories?limit=100", token);
    setCategories(res.items || res);
  }

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.set("search", search);
      if (categoryId) params.set("categoryId", categoryId);
      if (isActive) params.set("isActive", isActive);
      const res = await api.get(`/products?${params.toString()}`, token);
      setItems(res.items || res);
      setTotalPages(res.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page]);

  function applyFilters() {
    setPage(1);
    load();
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      stock: p.stock,
      image: p.image || "",
      categoryId: p.category?.id || p.categoryId || "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock) || 0,
      categoryId: Number(form.categoryId),
    };
    try {
      if (editing) {
        await api.patch(`/products/${editing.id}`, payload, token);
      } else {
        await api.post("/products", payload, token);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleStatus(p) {
    try {
      await api.patch(`/products/${p.id}/status`, { isActive: !p.isActive }, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(p) {
    if (!confirm(`Удалить автомобиль «${p.name}»?`)) return;
    try {
      await api.del(`/products/${p.id}`, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Layout title="Автомобили">
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select value={isActive} onChange={(e) => setIsActive(e.target.value)}>
            <option value="">Любой статус</option>
            <option value="true">Активные</option>
            <option value="false">Скрытые</option>
          </select>
          <button className="btn btn-sm" onClick={applyFilters}>
            Применить
          </button>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Добавить автомобиль
        </button>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>Автомобили не найдены</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Фото</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      <img src={p.image} alt={p.name} className={styles.imgThumb} />
                    ) : (
                      <div className={styles.imgThumb} />
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category?.name || "—"}</td>
                  <td>{formatSum(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <span className={`badge ${p.isActive ? "badge-on" : "badge-off"}`}>
                      {p.isActive ? "Активен" : "Скрыт"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button className="btn btn-sm" onClick={() => openEdit(p)}>
                        Изменить
                      </button>
                      <button className="btn btn-sm" onClick={() => toggleStatus(p)}>
                        {p.isActive ? "Скрыть" : "Активировать"}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p)}>
                        Удалить
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
              ← Назад
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Вперёд →
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal title={editing ? "Редактировать автомобиль" : "Новый автомобиль"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave}>
            <div className="field">
              <label>Название</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Категория</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">Выберите</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Цена (в сумах)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                min={1}
              />
            </div>
            <div className="field">
              <label>Количество на складе</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                min={0}
              />
            </div>
            <div className="field">
              <label>Ссылка на изображение</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <div className="field">
              <label>Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Отмена
              </button>
              <button type="submit" className="btn btn-primary">
                Сохранить
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
