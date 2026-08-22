import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

const EMPTY_FORM = { login: "", password: "", fullName: "" };

export default function AdminsPage() {
  const { token, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get("/admins?limit=100", token);
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

  function openEdit(admin) {
    setEditing(admin);
    setForm({ login: admin.login, password: "", fullName: admin.fullName });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        const payload = { fullName: form.fullName };
        if (!editing.isSuperAdmin) {
          payload.login = form.login;
          if (form.password) payload.password = form.password;
        }
        await api.patch(`/admins/${editing.id}`, payload, token);
      } else {
        await api.post("/admins", form, token);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(admin) {
    if (!confirm(`"${admin.fullName}" hisobini o'chirasizmi?`)) return;
    try {
      await api.del(`/admins/${admin.id}`, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  const canManage = !!user?.isSuperAdmin;

  return (
    <Layout title="Adminlar">
      <div className={styles.toolbar}>
        <div />
        {canManage && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Admin qo'shish
          </button>
        )}
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>Yuklanmoqda...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ism</th>
                <th>Login</th>
                <th>Turi</th>
                {canManage && <th></th>}
              </tr>
            </thead>
            <tbody>
              {items.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.fullName}</td>
                  <td>{admin.login}</td>
                  <td>
                    <span className={`badge ${admin.isSuperAdmin ? "badge-on" : "badge-off"}`}>
                      {admin.isSuperAdmin ? "Bosh admin" : "Admin"}
                    </span>
                  </td>
                  {canManage && (
                    <td>
                      <div className={styles.rowActions}>
                        <button className="btn btn-sm" onClick={() => openEdit(admin)}>
                          Tahrirlash
                        </button>
                        {!admin.isSuperAdmin && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(admin)}>
                            O'chirish
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <Modal title={editing ? "Adminni tahrirlash" : "Yangi admin"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave}>
            <div className="field">
              <label>To'liq ism</label>
              <input
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            {!(editing?.isSuperAdmin) && (
              <>
                <div className="field">
                  <label>Login</label>
                  <input
                    value={form.login}
                    onChange={(e) => setForm({ ...form, login: e.target.value })}
                    required
                    minLength={3}
                  />
                </div>
                <div className="field">
                  <label>{editing ? "Yangi parol (ixtiyoriy)" : "Parol"}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editing}
                    minLength={6}
                  />
                </div>
              </>
            )}
            {error && <p className="error-text">{error}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="btn" onClick={() => setModalOpen(false)}>
                Bekor qilish
              </button>
              <button type="submit" className="btn btn-primary">
                Saqlash
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Layout>
  );
}
