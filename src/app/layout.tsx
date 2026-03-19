import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Bonded | Relationship Percentage Game",
  description:
    "A multiplayer question game for friends, couples, families, and groups to see how well they know each other.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
