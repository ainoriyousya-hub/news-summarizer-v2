import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ニュース要約アプリ v2",
  description: "毎朝ニュースを自動収集し、AI で日本語要約して表示するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-950 text-white">
        <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-blue-800">
          {children}
        </div>
      </body>
    </html>
  );
}
