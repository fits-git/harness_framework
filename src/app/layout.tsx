import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChallengePick",
  description: "요즘 핫한 아이돌 챌린지/댄스 영상을 추천해드려요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        {children}
      </body>
    </html>
  );
}
