"use client";
import { useState } from "react";

type Customer = {
  id: string;
  name: string;
  endpoint: string;
  createdAt: string | Date;
};

export default function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string, name: string) {
    if (!confirm(`${name} さんを削除しますか？`)) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <>
      <div style={styles.header}>
        <h1 style={styles.heading}>登録者一覧</h1>
        <span style={styles.badge}>{customers.length}人</span>
      </div>
      <input
        style={styles.search}
        type="text"
        placeholder="名前で検索..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {filtered.length === 0 ? (
        <p style={styles.empty}>登録者がいません</p>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>名前</span>
            <span>登録日</span>
            <span></span>
          </div>
          {filtered.map((c) => (
            <div key={c.id} style={styles.tableRow}>
              <span style={styles.name}>{c.name}</span>
              <span style={styles.date}>
                {new Date(c.createdAt).toLocaleDateString("ja-JP")}
              </span>
              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(c.id, c.name)}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  heading: { fontSize: 24, fontWeight: "bold", color: "#2c3e50" },
  badge: {
    background: "#3498db",
    color: "#fff",
    borderRadius: 20,
    padding: "2px 12px",
    fontSize: 13,
    fontWeight: "bold",
  },
  search: {
    width: "100%",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: 14,
    marginBottom: 16,
    outline: "none",
    background: "#fff",
  },
  table: {
    background: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 80px",
    padding: "12px 20px",
    background: "#f8f9fa",
    fontSize: 12,
    fontWeight: "bold",
    color: "#888",
    borderBottom: "1px solid #eee",
  },
  tableRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 80px",
    padding: "14px 20px",
    alignItems: "center",
    borderBottom: "1px solid #f0f0f0",
  },
  name: { fontSize: 14, fontWeight: "bold", color: "#333" },
  date: { fontSize: 13, color: "#888" },
  deleteBtn: {
    background: "transparent",
    border: "1px solid #e74c3c",
    color: "#e74c3c",
    borderRadius: 6,
    padding: "4px 12px",
    fontSize: 12,
    cursor: "pointer",
  },
  empty: { color: "#aaa", fontSize: 14, textAlign: "center", padding: "48px 0" },
};
