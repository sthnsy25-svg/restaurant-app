"use client";
import { useState, useEffect } from "react";

type BroadcastHistory = {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  recipientCount: number;
};

export default function BroadcastClient() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<{ succeeded: number; failed: number } | null>(null);
  const [history, setHistory] = useState<BroadcastHistory[]>([]);

  useEffect(() => {
    fetch("/api/broadcast")
      .then((r) => r.json())
      .then(setHistory)
      .catch(() => {});
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm(`全登録者に通知を送信します。よろしいですか？`)) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        setStatus("error");
      } else {
        setResult(data);
        setStatus("success");
        setTitle("");
        setBody("");
        const h = await fetch("/api/broadcast").then((r) => r.json());
        setHistory(h);
      }
    } catch {
      alert("通信エラーが発生しました");
      setStatus("error");
    }
  }

  return (
    <>
      <h1 style={styles.heading}>一斉通知送信</h1>
      <div style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>新規配信</h2>
          {status === "success" && result && (
            <div style={styles.successBanner}>
              ✅ {result.succeeded}人に通知しました
              {result.failed > 0 && `（失敗: ${result.failed}件）`}
            </div>
          )}
          <form onSubmit={handleSend} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>タイトル</label>
              <input
                style={styles.input}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 今週末のお得情報"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>本文</label>
              <textarea
                style={styles.textarea}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="通知の本文を入力してください..."
                required
                rows={8}
              />
            </div>
            <button
              style={{ ...styles.button, opacity: status === "loading" ? 0.7 : 1 }}
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "送信中..." : "🔔 全員に通知"}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>送信履歴</h2>
          {history.length === 0 ? (
            <p style={styles.empty}>まだ送信履歴がありません</p>
          ) : (
            <div style={styles.historyList}>
              {history.map((h) => (
                <div key={h.id} style={styles.historyItem}>
                  <p style={styles.historySubject}>{h.title}</p>
                  <p style={styles.historyMeta}>
                    {new Date(h.sentAt).toLocaleString("ja-JP")} ・ {h.recipientCount}人
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 24, fontWeight: "bold", color: "#2c3e50", marginBottom: 24 },
  grid: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 },
  card: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  cardTitle: { fontSize: 16, fontWeight: "bold", color: "#2c3e50", marginBottom: 20 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: "bold", color: "#555" },
  input: { border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" },
  textarea: { border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", resize: "vertical" },
  button: { background: "#e67e22", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: "bold", cursor: "pointer" },
  successBanner: { background: "#d5f5e3", color: "#27ae60", padding: "12px 16px", borderRadius: 8, fontSize: 14, marginBottom: 16 },
  historyList: { display: "flex", flexDirection: "column", gap: 12 },
  historyItem: { padding: "12px 16px", background: "#f8f9fa", borderRadius: 8 },
  historySubject: { fontSize: 14, fontWeight: "bold", color: "#333" },
  historyMeta: { fontSize: 12, color: "#888", marginTop: 4 },
  empty: { color: "#aaa", fontSize: 14, textAlign: "center", padding: "24px 0" },
};
