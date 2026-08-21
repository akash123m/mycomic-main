import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Libre_Baskerville } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "MyComic — Where Stories Come Alive",
    template: "%s | MyComic",
  },
  description:
    "Discover original comics, follow your favorite series, and immerse yourself in worlds beyond imagination. MyComic is where stories come alive, one panel at a time.",
  keywords: [
    "comics",
    "webcomics",
    "manga",
    "manhwa",
    "read comics online",
    "free comics",
    "original stories",
  ],
  openGraph: {
    title: "MyComic — Where Stories Come Alive",
    description:
      "Discover original comics and immerse yourself in worlds beyond imagination.",
    type: "website",
    siteName: "MyComic",
    images: ["/images/hero-bg.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyComic — Where Stories Come Alive",
    description:
      "Discover original comics and immerse yourself in worlds beyond imagination.",
  },
};

import AppLayout from "@/components/layout/AppLayout";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${libreBaskerville.variable} dark`}
      style={{ colorScheme: "dark" }}
    >
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
        }}
      >
        <QueryProvider>
          <SettingsProvider>
            <AppLayout>{children}</AppLayout>
          </SettingsProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
