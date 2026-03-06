import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BurnSight — Startup Survival Intelligence",
  description:
    "Predict when your startup will run out of money. AI-powered burn rate analysis, risk scoring, anomaly detection, and survival modeling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
