import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 静态导出配置，用于 Gitee Pages
  output: "export",
  // 图片使用本地路径而非优化
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
