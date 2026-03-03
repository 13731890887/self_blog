# Cloudflare Pages 部署指南

## 概述

本项目是 Next.js 静态导出博客，部署目标为 Cloudflare Pages。

## 本地命令

```bash
npm ci
npm run dev
npm run lint
npm run type-check
npm run build
```

`npm run build` 会生成静态文件到 `out/` 目录。

## Cloudflare Pages 配置

在 Pages 项目中使用以下构建设置：

```txt
Framework preset: Next.js (Static HTML Export)
Build command: npm run build
Build output directory: out
Node.js version: 20
```

## 环境变量

如果使用留言后端服务（Waline/自建 API），在 Pages 中配置：

```txt
NEXT_PUBLIC_WALINE_URL=https://your-comment-service.example.com
```

说明：
- 该变量用于前端调用你的后端留言服务。
- 修改环境变量后需重新触发部署。

## 发布流程

1. 提交代码并推送到 GitHub `main`
2. Cloudflare Pages 自动拉取并构建
3. 发布完成后在 `*.pages.dev` 或绑定域名访问

## 常见排查

- 构建失败：先本地执行 `npm run lint && npm run type-check && npm run build`
- 页面 404：确认输出目录是 `out`
- 留言不可用：确认 `NEXT_PUBLIC_WALINE_URL` 指向可公网访问的后端服务
