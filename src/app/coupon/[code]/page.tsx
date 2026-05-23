"use client";
import { useEffect, useState } from "react";

type CouponData = {
  code: string;
  isUsed: boolean;
  usedAt: string | null;
  customerName: string;
  coupon: {
    title: string;
    description: string;
    discount: string;
    expiresAt: string;
  };
};

export default function CouponPage({ params }: { params: { code: string } }) {
  const [data, setData] = useState<CouponData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/coupons/check/${params.code}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("読み込みに失敗しました"))
      .finally(() => setLoading(false));
  }, [params.code]);

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={{ color: "#fff", fontSize: 18 }}>読み込み中...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>❌</div>
          <p style={{ textAlign: "center", fontSize: 16, color: "#555" }}>
            {error || "クーポンが見つかりません"}
          </p>
        </div>
      </div>
    );
  }

  const isExpired = new Date(data.coupon.expiresAt) < new Date();
  const expiresAt = new Date(data.coupon.expiresAt).toLocaleDateString("ja-JP");

  if (data.isUsed) {
    return (
      <div style={{ ...styles.page, background: "linear-gradient(135deg, #95a5a6, #7f8c8d)" }}>
        <div style={styles.card}>
          <div style={{ fontSize: 64, textAlign: "center", marginBottom: 16 }}>✅</div>
          <h1 style={{ ...styles.title, color: "#7f8c8d" }}>使用済み</h1>
          <p style={styles.subtitle}>このクーポンはすでに使用されました</p>
          <div style={{ ...styles.couponBox, border: "2px solid #bdc3c7", background: "#f8f9fa" }}>
            <p style={{ fontSize: 20, fontWeight: "bold", color: "#95a5a6" }}>{data.coupon.title}</p>
            <p style={{ fontSize: 36, fontWeight: "bold", color: "#95a5a6", margin: "8px 0" }}>
              {data.coupon.discount}
            </p>
          </div>
          {data.usedAt && (
            <p style={{ textAlign: "center", fontSize: 13, color: "#999", marginTop: 16 }}>
              使用日時: {new Date(data.usedAt).toLocaleString("ja-JP")}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div style={{ ...styles.page, background: "linear-gradient(135deg, #95a5a6, #7f8c8d)" }}>
        <div style={styles.card}>
          <div style={{ fontSize: 64, textAlign: "center", marginBottom: 16 }}>⏰</div>
          <h1 style={{ ...styles.title, color: "#7f8c8d" }}>有効期限切れ</h1>
          <p style={styles.subtitle}>このクーポンは有効期限が切れています</p>
          <div style={{ ...styles.couponBox, border: "2px solid #bdc3c7", background: "#f8f9fa" }}>
            <p style={{ fontSize: 20, fontWeight: "bold", color: "#95a5a6" }}>{data.coupon.title}</p>
            <p style={{ fontSize: 14, color: "#999", marginTop: 8 }}>有効期限: {expiresAt}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <p style={styles.nameLabel}>{data.customerName} 様</p>
        <div style={styles.couponBox}>
          <p style={{ fontSize: 12, color: "#e67e22", fontWeight: "bold", letterSpacing: 2, marginBottom: 8 }}>
            COUPON
          </p>
          <p style={{ fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 4 }}>
            {data.coupon.title}
          </p>
          <p style={{ fontSize: 40, fontWeight: "bold", color: "#e67e22", margin: "12px 0" }}>
            {data.coupon.discount}
          </p>
          {data.coupon.description && (
            <p style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>{data.coupon.description}</p>
          )}
          <p style={{ fontSize: 13, color: "#999", marginTop: 12 }}>有効期限: {expiresAt}</p>
        </div>
        <div style={styles.instruction}>
          <p style={{ fontSize: 14, color: "#e67e22", fontWeight: "bold", marginBottom: 4 }}>
            ご利用方法
          </p>
          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
            この画面をスタッフにお見せください。<br />
            スタッフが使用済みにします。
          </p>
        </div>
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
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 400,
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  nameLabel: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 16,
  },
  couponBox: {
    border: "2px dashed #e67e22",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
    background: "#fff8f0",
    margin: "16px 0",
  },
  instruction: {
    background: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    textAlign: "center",
  },
};
