import type { Metadata } from "next";
import "../../../styles/index.css";

export const metadata: Metadata = {
  title: "Authenticating - CRC",
  description: "Processing your authentication",
};

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 