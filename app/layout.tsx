import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "장표 전쟁 · Slide Wars",
  description: "한국 대기업 조직 생존 전략 게임. 모든 선택에는 대가가 있다.",
  openGraph: {
    title: "장표 전쟁 · Slide Wars",
    description: "한국 대기업 조직 생존 전략 게임",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full bg-[#0d1117] text-white">{children}</body>
    </html>
  );
}
