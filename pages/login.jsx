import { useState } from "react";
import Head from "next/head";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Login.module.scss";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ login: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.login, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Вход — Virtual Auto Market</title>
      </Head>
      <div className={styles.page}>
        <div className={`${styles.glow} ${styles.glowA}`} />
        <div className={`${styles.glow} ${styles.glowB}`} />
        <div className={styles.card}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>V</div>
            <span className={styles.brand}>Virtual Auto Market</span>
          </div>
          <h1 className={styles.title}>Вход в панель управления</h1>
          <p className={styles.subtitle}>Введите логин и пароль администратора</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Логин</label>
              <input
                type="text"
                placeholder="admin"
                value={form.login}
                onChange={(e) => setForm({ ...form, login: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Пароль</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={loading}>
              {loading ? "Выполняется вход..." : "Войти"}
            </button>
          </form>

          <p className={styles.hint}>По умолчанию: admin / admin123</p>
        </div>
      </div>
    </>
  );
}
