import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/AdminShell";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [customerCount, couponCount, broadcastCount] = await Promise.all([
    prisma.customer.count({ where: { isActive: true } }),
    prisma.coupon.count({ where: { isActive: true } }),
    prisma.broadcast.count(),
  ]);

  const recentBroadcasts = await prisma.broadcast.findMany({
    orderBy: { sentAt: "desc" },
    take: 5,
  });

  return (
    <AdminShell>
      <h1 style={styles.heading}>ダッシュボード</h1>
      <div style={styles.statsGrid} className="stats-grid">
        <StatCard label="登録者数" value={customerCount} unit="人" color="#3498db" />
        <StatCard label="クーポン数" value={couponCount} unit="種" color="#e67e22" />
        <StatCard label="送信履歴" value={broadcastCount} unit="回" color="#2ecc71" />
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>最近の配信履歴</h2>
        {recentBroadcasts.length === 0 ? (
          <p style={styles.empty}>まだ配信履歴がありません</p>
        ) : (
          <div style={styles.list}>
            {recentBroadcasts.map((b) => (
              <div key={b.id} style={styles.listItem}>
                <div>
                  <p style={styles.listTitle}>{b.title}</p>
                  <p style={styles.listMeta}>
                    {new Date(b.sentAt).toLocaleString("ja-JP")} ・ {b.recipientCount}人に送信
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>
        <span style={{ color }}>{value}</span>
        <span style={styles.statUnit}>{unit}</span>
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#2c3e50" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 },
  statCard: {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  statLabel: { fontSize: 13, color: "#888", marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: "bold" },
  statUnit: { fontSize: 16, color: "#888", marginLeft: 4 },
  section: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 16, color: "#2c3e50" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  listItem: {
    padding: "12px 16px",
    background: "#f8f9fa",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
  },
  listTitle: { fontSize: 14, fontWeight: "bold", color: "#333" },
  listMeta: { fontSize: 12, color: "#888", marginTop: 4 },
  empty: { color: "#aaa", fontSize: 14, textAlign: "center", padding: "24px 0" },
};
