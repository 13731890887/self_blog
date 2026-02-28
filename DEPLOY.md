# 腾讯云部署指南

## 概述

本项目是一个 Next.js 静态博客，配置了静态导出和 GitHub Actions 自动部署到腾讯云。

## 技术栈

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 样式
- MDX 博客文章支持
- Giscus 评论系统
- 代码高亮

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建静态文件
npm run build

# 预览构建结果
npm run preview
```

## 腾讯云部署

### 1. 配置 COS 存储桶

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/cos)
2. 创建存储桶，选择：
   - **地域**：选择就近地域
   - **访问权限**：公有读私有写
3. 开启**静态网站**托管

### 2. 配置 CDN 加速

1. 创建 CDN 加速域名
2. 源站类型选择 **COS 源**
3. 配置缓存规则：
   - 文件名带参数：不缓存
   - 静态文件：缓存 30 天
   - HTML 文件：不缓存

### 3. 配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

| Secret 名称 | 说明 | 获取方式 |
|------------|------|----------|
| `TENCENT_SECRET_ID` | 腾讯云 API 密钥 ID | [访问管理](https://console.cloud.tencent.com/cam/capi) |
| `TENCENT_SECRET_KEY` | 腾讯云 API 密钥 Key | 同上 |
| `TENCENT_COS_BUCKET` | COS 存储桶名称 | 格式：`bucket-name-appid` |
| `TENCENT_COS_REGION` | COS 所在地域 | 如：`ap-guangzhou` |
| `TENCENT_CDN_REGION` | CDN 加速地域 | 如：`ap-guangzhou` |
| `CDN_DOMAIN` | CDN 加速域名 | 如：`blog.example.com` |

### 4. 配置 Giscus 评论

1. 访问 [Giscus](https://giscus.app)
2. 配置你的 GitHub 仓库
3. 复制配置信息到 `src/components/Giscus.tsx`：

```typescript
<GiscusComponent
  repo="你的用户名/仓库名"
  repoId="你的仓库ID"
  category="Announcements"
  categoryId="你的分类ID"
  // ...
/>
```

## 写博客

在 `content/posts/` 目录下创建 `.mdx` 或 `.md` 文件：

```mdx
---
title: "文章标题"
date: "2025-02-28"
excerpt: "文章摘要"
tags: ["标签1", "标签2"]
author: "作者名"
---

# 文章内容

这里是文章正文...
```

## 目录结构

```
self_web/
├── .github/workflows/
│   └── deploy.yml        # GitHub Actions 部署配置
├── content/posts/        # MDX 博客文章
├── src/
│   ├── app/              # Next.js App Router 页面
│   ├── components/       # React 组件
│   ├── lib/              # 工具函数
│   └── types/            # TypeScript 类型
├── package.json
├── next.config.ts        # Next.js 配置
└── tailwind.config.ts    # Tailwind 配置
```

## 推送到主分支后

GitHub Actions 会自动：
1. 构建静态文件到 `out/` 目录
2. 上传到腾讯云 COS
3. 刷新 CDN 缓存

几分钟后，你的博客就会更新！

## 常见问题

### 构建失败

检查 `package.json` 中的依赖是否正确安装。

### 评论不显示

确保 Giscus 配置正确，且仓库已开启 Discussions。

### 代码高亮不生效

检查 `globals.css` 中的 `.hljs` 样式是否加载。
