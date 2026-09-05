import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Layout.module.scss";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Главная", icon: "◆" },
  { href: "/products", label: "Автомобили", icon: "🚗" },
  { href: "/categories", label: "Категории", icon: "▤" },
  { href: "/orders", label: "Заказы", icon: "🧾" },
  { href: "/customers", label: "Клиенты", icon: "👤" },
  { href: "/reviews", label: "Отзывы", icon: "★" },
  { href: "/banners", label: "Баннеры и акции", icon: "◈" },
  { href: "/notifications", label: "Уведомления", icon: "🔔" },
  { href: "/pickup-points", label: "Точки выдачи", icon: "⌖" },
];

export default function Layout({ title, children }) {
  const { token, user, ready, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token]);

  if (!ready || !token) return null;

  return (
    <>
      <Head>
        <title>{title ? `${title} — Virtual Auto Market` : "Virtual Auto Market"}</title>
      </Head>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>V</div>
            <div className={styles.logoText}>
              Virtual Auto
              <br />
              Market
              <span className={styles.logoSub}>ADMIN PANEL</span>
            </div>
          </div>

          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active = router.pathname === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href);
                  }}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className={styles.userBox}>
            <div className={styles.userName}>{user?.fullName || "..."}</div>
            <div className={styles.userRole}>Администратор</div>
            <button className={`btn btn-sm ${styles.logoutBtn}`} onClick={logout}>
              Выйти
            </button>
          </div>
        </aside>

        <div className={styles.main}>
          <header className={styles.topbar}>
            <h1 className={styles.pageTitle}>{title}</h1>
            <div className={styles.topbarMeta}><span className={styles.statusDot} /> Система работает</div>
          </header>
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </>
  );
}
