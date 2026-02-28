import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 静态导出配置
  output: "export",
  // 图片使用本地路径而非优化
  images: {
    unoptimized: true,
  },
  // 页面预渲染
  trailingSlash: true,
  // 支持 MDX 文件
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [require("remark-gfm")],
    rehypePlugins: [require("rehype-slug"), require("rehype-highlight")],
  },
});

export default withMDX(nextConfig);
