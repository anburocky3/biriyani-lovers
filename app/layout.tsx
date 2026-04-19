import type { Metadata } from "next";
import { Sora, Bree_Serif, Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const bree = Bree_Serif({
  variable: "--font-geist-mono",
  weight: "400",
  subsets: ["latin"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  weight: ["400", "700"],
  subsets: ["tamil"],
});

export const metadata: Metadata = {
  title: "Biriyani Lovers",
  description: "Cook perfect biriyani with vessel-aware smart recipes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${bree.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
