export type Locale = 'zh' | 'en';

export const localeMeta = {
  zh: {
    lang: 'zh-CN',
    prefix: ''
  },
  en: {
    lang: 'en',
    prefix: '/en'
  }
} as const;

export const siteCopy = {
  zh: {
    brand: 'Self Blog',
    navArticles: '文章',
    navTags: '标签',
    navAdmin: '后台',
    enterGarden: '进入花园',
    footer: 'Digital Garden Noir。为低带宽阅读而构建。',
    articleArchive: '文章归档',
    latestNotes: '最新笔记',
    recentWriting: '最近写作',
    viewAll: '查看全部',
    toc: '目录',
    tldr: 'AI 摘要',
    reads: '阅读',
    protectedRoute: '受保护路由',
    adminTitle: '后台写作控制台',
    adminDescription: '这里是标题优化、标签生成、可读性检查和 meta 描述生成的框架页。鉴权和服务端校验将在后续实现。',
    adminFeatureSlots: '功能槽位',
    adminPlannedControls: '计划中的控制项',
    returnHome: '返回首页',
    homeEyebrow: 'Digital Garden Noir',
    homeTitle: '一个围绕静谧、速度与 AI 辅助阅读而设计的低带宽个人博客。',
    homeDescription: 'Astro 默认输出静态 HTML，Preact 只在必要交互处水合，Hono 与 SQLite 则把动态链路压缩到最小。',
    readArticles: '阅读文章',
    openAdmin: '打开后台',
    articlesHeading: '文章',
    articlesDescription: '围绕性能预算、AI 原生界面以及受约束塑造的系统进行写作。',
    tagArchive: '标签归档',
    searchButton: '搜索',
    searchPlaceholder: '按主题、概念或短语搜索',
    searchClose: '关闭',
    aiCompanion: 'AI 伴读',
    aiCompanionTitle: 'Claude Haiku SSE 外壳',
    runtimeIsland: '运行时 Island',
    aiCompanionDescription: '生产版本会向 `/api/ai/chat` 发起请求，并通过 SSE 流式返回 token。当前版本先保留 UI 外壳，后续再接入真实模型。',
    featureOptimizeTitles: '优化标题候选',
    featureGenerateTags: '生成标签建议',
    featureReadability: '执行可读性诊断',
    featureMeta: '生成 SEO 描述',
    controlPassword: '密码门禁与会话 Cookie',
    controlPresets: '按内容类型提供 Prompt 预设',
    controlStreaming: '流式预览面板',
    controlChecklist: '发布检查清单',
    adminLiveDescription: '登录后可直接提交草稿，调用受保护的后台 AI 接口生成标题、标签、meta 描述和可读性建议。'
  },
  en: {
    brand: 'Self Blog',
    navArticles: 'Articles',
    navTags: 'Tags',
    navAdmin: 'Admin',
    enterGarden: 'Enter Garden',
    footer: 'Digital Garden Noir. Built for low-bandwidth reading.',
    articleArchive: 'Archive',
    latestNotes: 'Latest Notes',
    recentWriting: 'Recent writing',
    viewAll: 'View all',
    toc: 'On this page',
    tldr: 'AI TL;DR',
    reads: 'reads',
    protectedRoute: 'Protected Route',
    adminTitle: 'Admin writing cockpit',
    adminDescription: 'This page is the scaffold for title refinement, tag generation, readability checks, and meta description drafting. Authentication and server-side validation will be added in the implementation phase.',
    adminFeatureSlots: 'Feature slots',
    adminPlannedControls: 'Planned controls',
    returnHome: 'Return Home',
    homeEyebrow: 'Digital Garden Noir',
    homeTitle: 'A low-bandwidth personal blog engineered around stillness, speed, and AI-assisted reading.',
    homeDescription: 'Astro ships mostly static HTML, Preact hydrates only where interaction matters, and Hono plus SQLite keep the dynamic path narrow.',
    readArticles: 'Read Articles',
    openAdmin: 'Open Admin',
    articlesHeading: 'Articles',
    articlesDescription: 'Writing about performance budgets, AI-native interfaces, and systems shaped around constraints.',
    tagArchive: 'Tag archive',
    searchButton: 'Search',
    searchPlaceholder: 'Search by topic, concept, or phrase',
    searchClose: 'Close',
    aiCompanion: 'AI Companion',
    aiCompanionTitle: 'Claude Haiku SSE shell',
    runtimeIsland: 'runtime island',
    aiCompanionDescription: 'The production version posts to `/api/ai/chat` and streams token chunks over SSE. This scaffold keeps the UI shell in place while backend keys and prompts are wired later.',
    featureOptimizeTitles: 'Optimize title candidates',
    featureGenerateTags: 'Generate tag suggestions',
    featureReadability: 'Run readability diagnostics',
    featureMeta: 'Draft SEO description',
    controlPassword: 'Password gate + session cookie',
    controlPresets: 'Prompt presets by content type',
    controlStreaming: 'Streaming preview pane',
    controlChecklist: 'Publish checklist',
    adminLiveDescription: 'After login, submit a draft to the protected admin AI endpoint for title, tag, meta description, and readability suggestions.'
  }
} as const;

export function getLocaleCopy(locale: Locale) {
  return siteCopy[locale];
}

export function localizedPath(locale: Locale, path: string) {
  const normalized = path === '/' ? '' : path;
  return `${localeMeta[locale].prefix}${normalized || '/'}`.replace(/\/+/g, '/');
}
