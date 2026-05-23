"use client";
import { useState, useEffect } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "unsupported">("idle");
  const [message, setMessage] = useState("");
  const [vapidKey, setVapidKey] = useState("");

  useEffect(() => {
    fetch("/api/push/vapid")
      .then((r) => r.json())
      .then((d) => setVapidKey(d.publicKey || ""))
      .catch(() => {});

    if (!("PushManager" in window)) {
      setStatus("unsupported");
    }
  }, []);

  async function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async function handleSubmit(e: React.FormEvent) {
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
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

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
        setStatus("success");
      }
    } catch (err) {
      setMessage("エラーが発生しました。もう一度お試しください。");
      setStatus("error");
    }
  }

  if (status === "unsupported") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>⚠️</div>
          <h1 style={styles.title}>非対応のブラウザです</h1>
          <p style={styles.subtitle}>
            iPhoneの場合はSafariで開き、<br />
            「ホーム画面に追加」してから<br />
            アプリを起動してください。
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 64, textAlign: "center", marginBottom: 16 }}>🎉</div>
          <h1 style={styles.title}>登録完了！</h1>
          <p style={styles.subtitle}>
            {name} 様、ご登録ありがとうございます。<br />
            お得なクーポンやお知らせを<br />
            通知でお届けします。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>会員登録</h1>
        <p style={styles.subtitle}>
          登録するとお得なクーポンや<br />
          お知らせを通知でお届けします。
        </p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>お名前</label>
            <input
              style={styles.input}
              type="text"
              placeholder="山田 太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {status === "error" && (
            <p style={styles.error}>{message}</p>
          )}
          <button
            style={{ ...styles.button, opacity: status === "loading" ? 0.7 : 1 }}
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "登録中..." : "登録する"}
          </button>
          <p style={styles.note}>
            ※ 登録時に通知の許可を求めます
          </p>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    background: "linear-gradient(135deg, #fff8f0 0%, #ffe5cc 100%)",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 40,
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 1.7,
  },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 14, fontWeight: "bold", color: "#444" },
  input: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 16,
    outline: "none",
  },
  button: {
    background: "#e67e22",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "14px",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
  note: { fontSize: 12, color: "#aaa", textAlign: "center", marginTop: -8 },
  error: { color: "#e74c3c", fontSize: 14, textAlign: "center" },
};
