import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

const EMPTY_FORM = { title: "", image: "", link: "", position: 0, isActive: true };

export default function BannersPage() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/banners?limit=100", token);
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

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(b) {
    setEditing(b);
    setForm({
      title: b.title || "",
      image: b.image || "",
      link: b.link || "",
      position: b.position ?? 0,
      isActive: b.isActive !== false,
    });
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    const payload = { ...form, position: Number(form.position) || 0 };
    try {
      if (editing) {
        await api.patch(`/banners/${editing.id}`, payload, token);
      } else {
        await api.post("/banners", payload, token);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function toggleStatus(b) {
    try {
      await api.patch(`/banners/${b.id}/status`, { isActive: !b.isActive }, token);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  async function remove(b) {
    if (!confirm(`Удалить баннер «${b.title}»?`)) return;
    try {
      await api.del(`/banners/${b.id}`, token);
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <Layout title="Баннеры и акции">
      <div className={styles.toolbar}>
        <div className={styles.pageHint}>Слайдер и промо-блоки на главной витрины</div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Добавить баннер
        </button>
      </div>

      {error && (
        <div className={styles.errorPanel}>
          Не удалось загрузить баннеры: {error}. Проверьте, что backend поддерживает эндпоинт <code>/banners</code>.
        </div>
      )}

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>Баннеры не найдены</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Превью</th>
                <th>Заголовок</th>
                <th>Ссылка</th>
                <th>Позиция</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items
                .slice()
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((b) => (
                  <tr key={b.id}>
                    <td>
                      {b.image ? (
                        <img src={b.image} alt={b.title} className={styles.imgThumb} />
                      ) : (
                        <div className={styles.imgThumb} />
                      )}
                    </td>
                    <td>{b.title || "—"}</td>
                    <td>{b.link || "—"}</td>
                    <td>{b.position ?? 0}</td>
                    <td>
                      <span className={`badge ${b.isActive ? "badge-on" : "badge-off"}`}>
                        {b.isActive ? "Активен" : "Скрыт"}
                      </span>
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className="btn btn-sm" onClick={() => openEdit(b)}>
                          Изменить
                        </button>
                        <button className="btn btn-sm" onClick={() => toggleStatus(b)}>
                          {b.isActive ? "Скрыть" : "Показать"}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => remove(b)}>
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
        <Modal title={editing ? "Редактировать баннер" : "Новый баннер"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave}>
            <div className="field">
              <label>Заголовок</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="field">
              <label>Ссылка на изображение</label>
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
            </div>
            <div className="field">
              <label>Ссылка перехода (URL или /products/id)</label>
              <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
            </div>
            <div className="field">
              <label>Позиция в слайдере</label>
              <input
                type="number"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                min={0}
              />
            </div>
            {formError && <p className="error-text">{formError}</p>}
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
