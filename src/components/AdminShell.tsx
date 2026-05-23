"use client";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: "🏠" },
  { href: "/admin/qrcode", label: "QRコード", icon: "📷" },
  { href: "/admin/customers", label: "登録者一覧", icon: "👥" },
  { href: "/admin/broadcast", label: "一斉送信", icon: "📧" },
  { href: "/admin/coupons", label: "クーポン管理", icon: "🎟️" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>管理画面</div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              style={{
                ...styles.navItem,
                ...(pathname === item.href ? styles.navItemActive : {}),
              }}
            >
              <span style={{ marginRight: 8 }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          ログアウト
        </button>
      </aside>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    minHeight: "100vh",
  },
  sidebar: {
    width: 220,
    background: "#2c3e50",
    display: "flex",
    flexDirection: "column",
    padding: "24px 0",
    flexShrink: 0,
  },
  logo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    padding: "0 20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: 8,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    padding: "8px 0",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    transition: "all 0.15s",
    textDecoration: "none",
  },
  navItemActive: {
    color: "#fff",
    background: "rgba(255,255,255,0.1)",
    borderLeft: "3px solid #e67e22",
  },
  logoutBtn: {
    margin: "16px",
    padding: "10px",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 8,
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    cursor: "pointer",
  },
  main: {
    flex: 1,
    padding: 32,
    overflowY: "auto",
    background: "#f5f7fa",
  },
};
