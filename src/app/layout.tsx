import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的个人网站",
  description: "记录我的个人成长与思考",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
