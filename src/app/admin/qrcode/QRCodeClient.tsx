"use client";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";

export default function QRCodeClient() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  function handlePrint() {
    window.print();
  }

  if (!url) return null;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>

      <h1 style={styles.heading}>QRコード</h1>
      <p style={styles.sub}>このQRコードをお店に掲示してください。お客さんがスマホで読み込むと登録ページが開きます。</p>

      <div style={styles.grid}>
        {/* QRコード表示 */}
        <div style={styles.card} id="print-area">
          <div style={styles.qrWrapper}>
            <QRCodeSVG
              value={url}
              size={240}
              level="M"
              includeMargin
            />
          </div>
          <p style={styles.storeName}>会員登録はこちら</p>
          <p style={styles.urlText}>{url}</p>
          <p style={styles.printNote}>スマホのカメラで読み込んでください</p>
        </div>

        {/* 操作パネル */}
        <div style={styles.side}>
          <div style={styles.infoCard}>
            <h2 style={styles.infoTitle}>使い方</h2>
            <ol style={styles.steps}>
              <li style={styles.step}>
                <span style={styles.stepNum}>1</span>
                <span>このQRコードをプリントアウトするか、スマホの画面でお客さんに見せる</span>
              </li>
              <li style={styles.step}>
                <span style={styles.stepNum}>2</span>
                <span>お客さんがスマホのカメラでQRコードを読み込む</span>
              </li>
              <li style={styles.step}>
                <span style={styles.stepNum}>3</span>
                <span>登録ページが開くので名前とメアドを入力して登録完了</span>
              </li>
            </ol>
          </div>

          <button style={styles.printBtn} onClick={handlePrint}>
            🖨️ 印刷する
          </button>

          <div style={styles.urlCard}>
            <p style={styles.urlLabel}>登録ページURL</p>
            <p style={styles.urlValue}>{url}</p>
            <button
              style={styles.copyBtn}
              onClick={() => {
                navigator.clipboard.writeText(url);
                alert("コピーしました");
              }}
            >
              URLをコピー
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 24, fontWeight: "bold", color: "#2c3e50", marginBottom: 8 },
  sub: { fontSize: 14, color: "#666", marginBottom: 32 },
  grid: { display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems: "start" },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    width: 340,
  },
  qrWrapper: {
    padding: 16,
    background: "#fff",
    borderRadius: 12,
    border: "2px solid #f0f0f0",
  },
  storeName: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 8 },
  urlText: { fontSize: 11, color: "#aaa", wordBreak: "break-all", textAlign: "center" },
  printNote: { fontSize: 13, color: "#888", textAlign: "center" },
  side: { display: "flex", flexDirection: "column", gap: 20 },
  infoCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  infoTitle: { fontSize: 15, fontWeight: "bold", color: "#2c3e50", marginBottom: 16 },
  steps: { listStyle: "none", display: "flex", flexDirection: "column", gap: 14 },
  step: { display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14, color: "#444", lineHeight: 1.5 },
  stepNum: {
    background: "#e67e22",
    color: "#fff",
    borderRadius: "50%",
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: "bold",
    flexShrink: 0,
  },
  printBtn: {
    background: "#2c3e50",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "14px 24px",
    fontSize: 15,
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
  urlCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  urlLabel: { fontSize: 12, color: "#888", marginBottom: 6 },
  urlValue: { fontSize: 13, color: "#333", wordBreak: "break-all", marginBottom: 12 },
  copyBtn: {
    background: "#f0f0f0",
    border: "none",
    borderRadius: 6,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    color: "#555",
  },
};
