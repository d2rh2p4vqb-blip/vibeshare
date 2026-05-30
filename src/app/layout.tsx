import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VibeShare - Vibecoding 作品分享社区",
    template: "%s | VibeShare",
  },
  description: "分享你用 AI 创造的作品，发现更多灵感。类 Product Hunt + GitHub 的 Vibecoding 社区，支持作品展示、排行榜、实时群聊。",
  keywords: ["vibecoding", "AI", "作品分享", "社区", "Claude", "Cursor", "v0"],
  authors: [{ name: "VibeShare" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "VibeShare",
    title: "VibeShare - Vibecoding 作品分享社区",
    description: "分享你用 AI 创造的作品，发现更多灵感",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeShare - Vibecoding 作品分享社区",
    description: "分享你用 AI 创造的作品，发现更多灵感",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
