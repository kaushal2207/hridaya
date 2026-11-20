import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "HRIDAYA IT SOLUTIONS | Website Development & Digital Marketing Agency in Noida", template: "%s | HRIDAYA IT SOLUTIONS" },
  description: "Website development, graphic design, digital marketing and e-commerce management for businesses across India. Based in Noida, Uttar Pradesh.",
  applicationName: "HRIDAYA IT SOLUTIONS",
  icons: { icon: "/icon.svg" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#080D1B", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Unbounded:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
