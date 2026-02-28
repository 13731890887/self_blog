import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 静态导出配置
  output: "export",
  // 输出到 dist 目录（适配腾讯云）
  distDir: "dist",
  // 图片使用本地路径而非优化
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
