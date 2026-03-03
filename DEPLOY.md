# 部署指南（Cloudflare + 腾讯云）

## 概述

本项目是 Next.js 静态导出博客，推荐采用双部署：

- 海外访问：Cloudflare Pages
- 中国大陆访问：腾讯云 COS + CDN

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

## 腾讯云自动部署（GitHub Actions）

仓库已提供工作流：

`/.github/workflows/deploy-tencent.yml`

在 GitHub 仓库 Secrets 中配置以下变量：

- `TENCENT_SECRET_ID`
- `TENCENT_SECRET_KEY`
- `TENCENT_COS_BUCKET`（格式通常为 `bucket-name-appid`）
- `TENCENT_COS_REGION`（例如 `ap-guangzhou`）
- `TENCENT_CDN_REGION`（可选，用于刷新 CDN）
- `CDN_DOMAIN`（可选，例如 `seqiwang.cn`）

工作流会在 `main` 分支推送后自动执行：

1. `npm ci && npm run build`
2. 将 `out/` 全量同步到 COS（含删除旧文件）
3. 可选刷新腾讯云 CDN 缓存

## DNS 分线路建议

如果你要同时保留 Cloudflare 与腾讯云：

- 海外线路指向 Cloudflare Pages
- 中国大陆线路指向腾讯云 CDN 域名

这样可兼顾海外可用性和大陆访问稳定性。

## 发布流程

1. 提交代码并推送到 GitHub `main`
2. Cloudflare Pages 自动构建（海外）
3. GitHub Actions 自动同步到腾讯云 COS（大陆）
4. 通过分线路 DNS 提供统一域名访问

## 常见排查

- 构建失败：先本地执行 `npm run lint && npm run type-check && npm run build`
- 页面 404：确认输出目录是 `out`
- 留言不可用：确认 `NEXT_PUBLIC_WALINE_URL` 指向可公网访问的后端服务
