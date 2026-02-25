import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Material Stream",
  description: "Study videos with Pixeldrain + Stremio"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
