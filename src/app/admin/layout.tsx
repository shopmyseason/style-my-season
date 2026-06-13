import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Seasonal Color Match",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
