"use client";
import { useState, useEffect } from "react";

type Coupon = {
  id: string;
  title: string;
  description: string;
  discount: string;
  expiresAt: string;
  isActive: boolean;
  instances: { isUsed: boolean }[];
  _count: { instances: number };
};

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [useCode, setUseCode] = useState("");
  const [useMsg, setUseMsg] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    discount: "",
    expiresAt: "",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    const res = await fetch("/api/coupons");
    const data = await res.json();
    setCoupons(data);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ title: "", description: "", discount: "", expiresAt: "" });
      loadCoupons();
    } else {
      const d = await res.json();
      alert(d.error);
    }
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`「${coupon.title}」を削除しますか？\n配布済みのクーポンも全て削除されます。`)) return;
    await fetch(`/api/coupons/${coupon.id}`, { method: "DELETE" });
    setCoupons(prev => prev.filter(c => c.id !== coupon.id));
  }

  async function handleSend(coupon: Coupon) {
    if (!confirm(`「${coupon.title}」を全登録者にメール送信しますか？`)) return;
    setSending(coupon.id);
    const res = await fetch(`/api/coupons/${coupon.id}/send`, { method: "POST" });
    const data = await res.json();
    setSending(null);
    if (res.ok) {
      alert(`${data.succeeded}人に送信しました`);
      loadCoupons();
    } else {
      alert(data.error);
    }
  }

  async function handleUse(e: React.FormEvent) {
    e.preventDefault();
    const code = useCode.trim();
    if (!code) return;
    const res = await fetch(`/api/coupons/use/${code}`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setUseMsg(`✅ ${data.customerName} 様のクーポンを使用済みにしました`);
      setUseCode("");
      loadCoupons();
    } else {
      setUseMsg(`❌ ${data.error}`);
    }
  }

  return (
    <>
      <div style={styles.topRow}>
        <h1 style={styles.heading}>クーポン管理</h1>
        <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? "キャンセル" : "+ クーポン作成"}
        </button>
      </div>

      {/* 使用済み処理ボックス */}
      <div style={styles.useBox}>
        <h2 style={styles.cardTitle}>🎟️ クーポンを使用済みにする</h2>
        <p style={styles.useDesc}>
          お客さんのスマホに表示されたクーポンコードを入力してください
        </p>
        <form onSubmit={handleUse} style={styles.useForm}>
          <input
            style={styles.useInput}
            type="text"
            placeholder="クーポンコード（例: ABcd1234XYzw）"
            value={useCode}
            onChange={(e) => setUseCode(e.target.value)}
          />
          <button style={styles.useBtn} type="submit">使用済みにする</button>
        </form>
        {useMsg && (
          <p style={{ ...styles.useMsg, color: useMsg.startsWith("✅") ? "#27ae60" : "#e74c3c" }}>
            {useMsg}
          </p>
        )}
      </div>

      {showForm && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>新規クーポン作成</h2>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>クーポン名 *</label>
                <input
                  style={styles.input}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例: ドリンク1杯無料"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>割引内容 *</label>
                <input
                  style={styles.input}
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  placeholder="例: 10%OFF / 500円引き"
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>有効期限 *</label>
                <input
                  style={styles.input}
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>説明（任意）</label>
                <input
                  style={styles.input}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="例: ランチタイム限定"
                />
              </div>
            </div>
            <button style={styles.submitBtn} type="submit">作成する</button>
          </form>
        </div>
      )}

      <div style={styles.couponList}>
        {coupons.length === 0 ? (
          <p style={styles.empty}>クーポンがありません</p>
        ) : (
          coupons.map((c) => {
            const usedCount = c.instances.filter((i) => i.isUsed).length;
            const totalCount = c._count.instances;
            const isExpired = new Date(c.expiresAt) < new Date();
            return (
              <div key={c.id} style={{ ...styles.couponCard, opacity: isExpired ? 0.6 : 1 }}>
                <div style={styles.couponInfo}>
                  <div style={styles.couponHeader}>
                    <span style={styles.couponTitle}>{c.title}</span>
                    {isExpired && <span style={styles.expiredBadge}>期限切れ</span>}
                  </div>
                  <span style={styles.discountBadge}>{c.discount}</span>
                  {c.description && <p style={styles.desc}>{c.description}</p>}
                  <p style={styles.meta}>
                    有効期限: {new Date(c.expiresAt).toLocaleDateString("ja-JP")}
                    　・　使用済み: {usedCount} / {totalCount} 枚
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    style={{
                      ...styles.sendBtn,
                      opacity: sending === c.id || isExpired ? 0.5 : 1,
                    }}
                    onClick={() => handleSend(c)}
                    disabled={sending === c.id || isExpired}
                  >
                    {sending === c.id ? "送信中..." : "📧 配布する"}
                  </button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(c)}>
                    削除
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  heading: { fontSize: 24, fontWeight: "bold", color: "#2c3e50" },
  createBtn: { background: "#e67e22", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: "bold", cursor: "pointer" },
  useBox: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: "4px solid #e67e22" },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#2c3e50", marginBottom: 8 },
  useDesc: { fontSize: 13, color: "#666", marginBottom: 12 },
  useForm: { display: "flex", gap: 12 },
  useInput: { flex: 1, border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "monospace" },
  useBtn: { background: "#27ae60", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" },
  useMsg: { fontSize: 14, marginTop: 12, fontWeight: "bold" },
  card: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: "bold", color: "#555" },
  input: { border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" },
  submitBtn: { background: "#2c3e50", color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 15, fontWeight: "bold", cursor: "pointer", alignSelf: "flex-start" } as React.CSSProperties,
  couponList: { display: "flex", flexDirection: "column", gap: 16 },
  couponCard: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  couponInfo: { flex: 1 },
  couponHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  couponTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  expiredBadge: { background: "#95a5a6", color: "#fff", borderRadius: 4, padding: "2px 8px", fontSize: 11 },
  discountBadge: { display: "inline-block", background: "#fff3e0", color: "#e67e22", borderRadius: 4, padding: "2px 10px", fontSize: 14, fontWeight: "bold", marginBottom: 6 },
  desc: { fontSize: 13, color: "#555", marginBottom: 4 },
  meta: { fontSize: 12, color: "#888" },
  sendBtn: { background: "#e67e22", color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" },
  deleteBtn: { background: "none", border: "1px solid #ddd", borderRadius: 8, padding: "6px 18px", fontSize: 12, color: "#e74c3c", cursor: "pointer", whiteSpace: "nowrap" },
  empty: { color: "#aaa", fontSize: 14, textAlign: "center", padding: "48px 0" },
};
