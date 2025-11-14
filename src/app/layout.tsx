import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import "@solana/wallet-adapter-react-ui/styles.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: "variable",
});

export const metadata: Metadata = {
  title: "GREED Academy at Breakpoint 2025",
  description: "Stake, Learn, Win",
  twitter: {
    title: "GREED Academy",
    card: "summary_large_image",
    images: "https://i.imgur.com/5N6MZh6.png",
  },
  openGraph: {
    title: "GREED Academy",
    url: "https://greed.academy",
    images: "https://i.imgur.com/5N6MZh6.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistMono.variable} ${inter.variable} antialiased font-base tracking-tight`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
