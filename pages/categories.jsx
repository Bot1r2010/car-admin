import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

const EMPTY_FORM = { name: "", description: "" };

export default function CategoriesPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const query = search ? `?search=${encodeURIComponent(search)}&limit=100` : "?limit=100";
      const res = await api.get(`/categories${query}`, token);
      setItems(res.items || res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "" });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await api.patch(`/categories/${editing.id}`, form, token);
      } else {
        await api.post("/categories", form, token);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleStatus(cat) {
    try {
      await api.patch(`/categories/${cat.id}/status`, { isActive: !cat.isActive }, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`Удалить категорию «${cat.name}»?`)) return;
    try {
      await api.del(`/categories/${cat.id}`, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <Layout title="Категории">
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <button className="btn btn-sm" onClick={load}>
            Найти
          </button>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Добавить категорию
        </button>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>Категории не найдены</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Название</th>
                <th>Описание</th>
                <th>Автомобилей</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{cat.description || "—"}</td>
                  <td>{cat.productsCount ?? 0}</td>
                  <td>
                    <span className={`badge ${cat.isActive ? "badge-on" : "badge-off"}`}>
                      {cat.isActive ? "Активна" : "Скрыта"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button className="btn btn-sm" onClick={() => openEdit(cat)}>
                        Изменить
                      </button>
                      <button className="btn btn-sm" onClick={() => toggleStatus(cat)}>
                        {cat.isActive ? "Скрыть" : "Активировать"}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cat)}>
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

      {modalOpen && (
        <Modal title={editing ? "Редактировать категорию" : "Новая категория"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave}>
            <div className="field">
              <label>Название</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                minLength={2}
              />
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
