import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexSight - Real-time GPU Intelligence",
  description: "Real-time GPU monitoring dashboard for AI teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
