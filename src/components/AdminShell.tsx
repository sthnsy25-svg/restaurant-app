"use client";
import { useRouter, usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "ホーム", icon: "🏠" },
  { href: "/admin/customers", label: "登録者", icon: "👥" },
  { href: "/admin/broadcast", label: "通知", icon: "📢" },
  { href: "/admin/coupons", label: "クーポン", icon: "🎟️" },
  { href: "/admin/qrcode", label: "QR", icon: "📷" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const currentNav = navItems.find((n) => n.href === pathname);

  return (
    <>
      <style>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background: #f5f7fa;
        }
        /* サイドバー（PC） */
        .admin-sidebar {
          width: 220px;
          background: #1a1a2e;
          display: flex;
          flex-direction: column;
          padding: 0;
          flex-shrink: 0;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 100;
        }
        .admin-sidebar-logo {
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          padding: 20px;
          background: #e67e22;
          letter-spacing: 0.5px;
        }
        .admin-sidebar-logo span {
          font-size: 11px;
          opacity: 0.8;
          display: block;
          margin-top: 2px;
          font-weight: normal;
        }
        .admin-sidebar-nav {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 12px 0;
          gap: 2px;
        }
        .admin-sidebar-nav a {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 20px;
          color: rgba(255,255,255,0.6);
          font-size: 14px;
          text-decoration: none;
          border-left: 3px solid transparent;
          transition: all 0.15s;
        }
        .admin-sidebar-nav a:hover {
          color: #fff;
          background: rgba(255,255,255,0.06);
        }
        .admin-sidebar-nav a.active {
          color: #fff;
          background: rgba(230,126,34,0.15);
          border-left-color: #e67e22;
        }
        .admin-sidebar-nav a .nav-icon { font-size: 18px; }
        .admin-logout-btn {
          margin: 16px;
          padding: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: rgba(255,255,255,0.5);
          font-size: 13px;
          cursor: pointer;
        }
        /* メインコンテンツ（PC） */
        .admin-main {
          flex: 1;
          margin-left: 220px;
          padding: 32px;
          min-height: 100vh;
        }
        /* モバイルヘッダー */
        .admin-mobile-header {
          display: none;
        }
        /* モバイルボトムナビ */
        .admin-bottom-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .admin-sidebar { display: none; }
          .admin-main {
            margin-left: 0;
            padding: 16px;
            padding-top: 72px;
            padding-bottom: 80px;
          }
          .admin-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 56px;
            background: #1a1a2e;
            padding: 0 16px;
            z-index: 100;
          }
          .admin-mobile-header-title {
            color: #fff;
            font-size: 16px;
            font-weight: bold;
          }
          .admin-mobile-header-sub {
            color: rgba(255,255,255,0.6);
            font-size: 12px;
          }
          .admin-mobile-logout {
            background: rgba(255,255,255,0.1);
            border: none;
            border-radius: 8px;
            color: rgba(255,255,255,0.8);
            font-size: 13px;
            padding: 7px 14px;
            cursor: pointer;
          }
          .admin-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: 64px;
            background: #fff;
            border-top: 1px solid #eee;
            z-index: 100;
          }
          .admin-bottom-nav a {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            text-decoration: none;
            color: #aaa;
            font-size: 10px;
            transition: color 0.15s;
          }
          .admin-bottom-nav a.active {
            color: #e67e22;
          }
          .admin-bottom-nav a .bnav-icon { font-size: 22px; line-height: 1; }
        }
      `}</style>

      {/* モバイルヘッダー */}
      <header className="admin-mobile-header">
        <div>
          <div className="admin-mobile-header-title">
            {currentNav?.icon} {currentNav?.label || "管理画面"}
          </div>
        </div>
        <button className="admin-mobile-logout" onClick={handleLogout}>ログアウト</button>
      </header>

      <div className="admin-container">
        {/* PCサイドバー */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar-logo">
            岡べろべっろ<span>管理パネル</span>
          </div>
          <nav className="admin-sidebar-nav">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "active" : ""}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <button className="admin-logout-btn" onClick={handleLogout}>ログアウト</button>
        </aside>

        {/* メインコンテンツ */}
        <main className="admin-main">{children}</main>
      </div>

      {/* モバイルボトムナビ */}
      <nav className="admin-bottom-nav">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "active" : ""}
          >
            <span className="bnav-icon">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </>
  );
}
