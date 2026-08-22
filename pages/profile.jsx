import { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import styles from "../styles/DataView.module.scss";

export default function ProfilePage() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await api.patch("/admins/me/password", form, token);
      setSuccess("Parol muvaffaqiyatli almashtirildi.");
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout title="Profil">
      <div className={styles.sectionCard} style={{ maxWidth: 420 }}>
        <h3 className={styles.sectionTitle}>Hisob ma'lumotlari</h3>
        <p style={{ marginBottom: 20, color: "#8d94a3", fontSize: 14 }}>
          {user?.fullName} · {user?.login}
        </p>

        {user?.isSuperAdmin ? (
          <p style={{ color: "#8d94a3", fontSize: 13 }}>
            Bosh admin paroli faqat serverdagi sozlamalardan o'zgaradi.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Hozirgi parol</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Yangi parol</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            {success && <p style={{ color: "#35d07f", fontSize: 13, marginBottom: 12 }}>{success}</p>}
            <button type="submit" className="btn btn-primary">
              Parolni almashtirish
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
