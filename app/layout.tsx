import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jawa DTC App",
  description: "Jawa DTC Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}