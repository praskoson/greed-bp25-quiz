import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import "@solana/wallet-adapter-react-ui/styles.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: "variable",
});

const futuraBold = localFont({
  src: "../fonts/Futura-Bold.otf",
  display: "swap",
  style: "normal",
  variable: "--font-futura-bold",
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
        className={`${interTight.variable} ${futuraBold.variable} antialiased font-base`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
