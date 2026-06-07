"use client";
import { useState, useEffect } from "react";

type Coupon = {
  code: string;
  isUsed: boolean;
  usedAt: string | null;
  issuedAt: string;
  title: string;
  description: string;
  discount: string;
  expiresAt: string;
};

type Broadcast = {
  id: string;
  title: string;
  body: string;
  sentAt: string;
};

type MemberData = {
  id: string;
  name: string;
  coupons: Coupon[];
  broadcasts: Broadcast[];
};

export default function Page() {
  const [view, setView] = useState<"loading" | "register" | "member" | "unsupported">("loading");
  const [member, setMember] = useState<MemberData | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [vapidKey, setVapidKey] = useState("");
  const [tab, setTab] = useState<"coupon" | "news">("news");

  useEffect(() => {
    fetch("/api/push/vapid").then(r => r.json()).then(d => setVapidKey(d.publicKey || "")).catch(() => {});

    if (!("PushManager" in window)) {
      setView("unsupported");
      return;
    }

    // localStorageから会員IDを確認
    const stored = localStorage.getItem("restaurantMember");
    if (stored) {
      const { id } = JSON.parse(stored);
      fetch(`/api/me?customerId=${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data) {
            setMember(data);
            setView("member");
          } else {
            localStorage.removeItem("restaurantMember");
            setView("register");
          }
        })
        .catch(() => { localStorage.removeItem("restaurantMember"); setView("register"); });
    } else {
      setView("register");
    }
  }, []);

  async function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("loading");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("通知を許可してください。許可しないと登録できません。");
        setStatus("error");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const applicationServerKey = await urlBase64ToUint8Array(vapidKey);
      const subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      const sub = subscription.toJSON();
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subscription: sub }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "エラーが発生しました");
        setStatus("error");
      } else {
        localStorage.setItem("restaurantMember", JSON.stringify({ id: data.id, name: data.name }));
        setMember({ id: data.id, name: data.name, coupons: [], broadcasts: [] });
        setStatus("success");
        setView("member");
      }
    } catch {
      setMessage("エラーが発生しました。もう一度お試しください。");
      setStatus("error");
    }
  }

  async function refreshMember() {
    if (!member) return;
    const res = await fetch(`/api/me?customerId=${member.id}`);
    if (res.ok) setMember(await res.json());
  }

  // ローディング
  if (view === "loading") {
    return (
      <div style={s.page}>
        <div style={{ color: "#999", fontSize: 14 }}>読み込み中...</div>
      </div>
    );
  }

  // 非対応ブラウザ
  if (view === "unsupported") {
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>📱</div>
          <h1 style={{ ...s.title, fontSize: 22 }}>あと少しで登録できます！</h1>
          {isIOS ? (
            <>
              <p style={{ ...s.sub, marginBottom: 24 }}>
                このアプリはiPhoneのホーム画面に追加することで利用できます。<br />
                クーポンやお得なお知らせをプッシュ通知でお届けするため、以下の手順で登録をお願いします🙏
              </p>
              <div style={step.list}>
                {[
                  ["1", "Safariで開く",
                    "このページをSafari（標準ブラウザ）で開いてください。LINEやChromeなど他のアプリのブラウザからは登録できません。URLをコピーしてSafariに貼り付けてください。"],
                  ["2", "ホーム画面に追加する",
                    "Safariで開いたら、画面下中央にある共有ボタン（四角から矢印が出ているアイコン）をタップ。メニューの中から「ホーム画面に追加」を選んでください。"],
                  ["3", "アイコンから起動して登録する",
                    "ホーム画面に追加されたアイコンをタップしてアプリを起動してください。お名前を入力して「登録する」を押すだけで完了です！通知の許可も忘れずにお願いします✅"],
                ].map(([n, t, d]) => (
                  <div key={n} style={step.item}>
                    <span style={step.num}>{n}</span>
                    <div><strong>{t}</strong><br /><span style={step.note}>{d}</span></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p style={{ ...s.sub, marginBottom: 24 }}>
                Androidをご利用の方は、<strong>Chromeブラウザ</strong>でこのページを開いてください。<br /><br />
                開いたら「通知を許可する」を選んでお名前を入力するだけで登録完了です！<br />
                通知を許可していただくことで、クーポンやお得な情報をいち早くお届けできます🎁
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // 登録フォーム
  if (view === "register") {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ fontSize: 48, textAlign: "center" }}>🐶</div>
          <h1 style={s.title}>会員登録</h1>
          <p style={s.sub}>登録するとお得なクーポンや<br />お知らせを通知でお届けします。</p>
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 14, fontWeight: "bold", color: "#444" }}>お名前</label>
              <input
                style={s.input}
                type="text"
                placeholder="山田 太郎"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            {status === "error" && <p style={{ color: "#e74c3c", fontSize: 14, textAlign: "center" }}>{message}</p>}
            <button style={{ ...s.btn, opacity: status === "loading" ? 0.7 : 1 }} type="submit" disabled={status === "loading"}>
              {status === "loading" ? "登録中..." : "登録する"}
            </button>
            <p style={{ fontSize: 12, color: "#aaa", textAlign: "center" }}>※ 登録時に通知の許可を求めます</p>
          </form>
        </div>
      </div>
    );
  }

  // 会員ページ
  const now = new Date();
  const activeCoupons = member?.coupons.filter(c => !c.isUsed && new Date(c.expiresAt) > now) ?? [];
  const usedCoupons = member?.coupons.filter(c => c.isUsed || new Date(c.expiresAt) <= now) ?? [];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* ヘッダー */}
      <div style={{ background: "#e67e22", padding: "20px 16px 16px", color: "#fff" }}>
        <p style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>おかえりなさい</p>
        <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 0 }}>{member?.name} さん</h1>
      </div>

      {/* タブ */}
      <div style={{ display: "flex", background: "#fff", borderBottom: "2px solid #f0f0f0" }}>
        {(["news", "coupon"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "14px 0", border: "none", background: "none", cursor: "pointer",
            fontSize: 14, fontWeight: "bold",
            color: tab === t ? "#e67e22" : "#999",
            borderBottom: tab === t ? "2px solid #e67e22" : "2px solid transparent",
            marginBottom: -2,
          }}>
            {t === "coupon" ? "🎫 クーポン" : "📢 お知らせ"}
          </button>
        ))}
      </div>

      <div style={{ padding: 16, maxWidth: 480, margin: "0 auto" }}>
        {/* 更新ボタン */}
        <button onClick={refreshMember} style={{
          width: "100%", padding: "10px", background: "#fff", border: "1px solid #ddd",
          borderRadius: 8, fontSize: 13, color: "#666", cursor: "pointer", marginBottom: 16,
        }}>
          🔄 最新情報に更新
        </button>

        {tab === "coupon" && (
          <>
            {activeCoupons.length === 0 && usedCoupons.length === 0 && (
              <div style={s.empty}>まだクーポンがありません</div>
            )}
            {activeCoupons.length > 0 && (
              <>
                <h2 style={s.sectionTitle}>使えるクーポン</h2>
                {activeCoupons.map(c => (
                  <div key={c.code} style={s.couponCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontWeight: "bold", fontSize: 16, color: "#333" }}>{c.title}</p>
                        <p style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{c.description}</p>
                      </div>
                      <span style={s.discount}>{c.discount}</span>
                    </div>
                    <div style={{ marginTop: 12, padding: "8px 12px", background: "#fff8f0", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: "#888" }}>コード</span>
                      <span style={{ fontFamily: "monospace", fontWeight: "bold", fontSize: 15, color: "#e67e22", letterSpacing: 1 }}>{c.code}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#aaa", marginTop: 8, textAlign: "right" }}>
                      有効期限: {new Date(c.expiresAt).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                ))}
              </>
            )}
            {usedCoupons.length > 0 && (
              <>
                <h2 style={{ ...s.sectionTitle, color: "#aaa" }}>使用済み・期限切れ</h2>
                {usedCoupons.map(c => (
                  <div key={c.code} style={{ ...s.couponCard, opacity: 0.5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontWeight: "bold", fontSize: 15 }}>{c.title}</p>
                      <span style={{ fontSize: 12, color: "#aaa" }}>{c.isUsed ? "使用済み" : "期限切れ"}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#aaa", marginTop: 4, fontFamily: "monospace" }}>{c.code}</p>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {tab === "news" && (
          <>
            {(member?.broadcasts.length ?? 0) === 0 && (
              <div style={s.empty}>まだお知らせはありません</div>
            )}
            {member?.broadcasts.map(b => (
              <div key={b.id} style={s.newsCard}>
                <p style={{ fontWeight: "bold", fontSize: 15, color: "#333" }}>{b.title}</p>
                <p style={{ fontSize: 14, color: "#555", marginTop: 6, lineHeight: 1.6 }}>{b.body}</p>
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 8, textAlign: "right" }}>
                  {new Date(b.sentAt).toLocaleDateString("ja-JP")} {new Date(b.sentAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "linear-gradient(135deg, #fff8f0 0%, #ffe5cc 100%)" },
  card: { background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginBottom: 8, color: "#333" },
  sub: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 24, lineHeight: 1.7 },
  input: { border: "1px solid #ddd", borderRadius: 8, padding: "12px 16px", fontSize: 16, outline: "none" },
  btn: { background: "#e67e22", color: "#fff", border: "none", borderRadius: 8, padding: "14px", fontSize: 16, fontWeight: "bold", cursor: "pointer" },
  empty: { textAlign: "center", color: "#aaa", fontSize: 14, padding: "40px 0" },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#555", marginBottom: 12, marginTop: 8 },
  couponCard: { background: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  discount: { background: "#e67e22", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 14, fontWeight: "bold", whiteSpace: "nowrap" },
  newsCard: { background: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
};

const step: Record<string, React.CSSProperties> = {
  list: { display: "flex", flexDirection: "column", gap: 12 },
  item: { display: "flex", alignItems: "flex-start", gap: 12, background: "#fff8f0", borderRadius: 10, padding: "12px 14px" },
  num: { background: "#e67e22", color: "#fff", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: "bold", flexShrink: 0 },
  note: { fontSize: 12, color: "#666", lineHeight: 1.5, marginTop: 2 },
};
