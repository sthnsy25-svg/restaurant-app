import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理画面 | 岡べろべっろ",
  manifest: "/manifest-admin.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "管理画面",
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
