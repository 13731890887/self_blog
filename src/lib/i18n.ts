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
    navHome: '主页',
    navArticles: '文章',
    navQuestions: '提问',
    navAdmin: '后台',
    themeDefault: '夜色',
    themeSoft: '浅雾',
    footer: '“AI 不是取代思考，而是放大思考的带宽。”',
    footerSecondary: '在缓慢之中整理知识，在交互之中逼近理解。',
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
    homeTitle: '先把问题问对',
    homeDescription: '这里存放那些值得反复推敲的笔记、系统与 AI 工作流。',
    hottestArticle: '最火文章',
    hottestArticleFallback: '阅读量还在积累中，先从最近的文章开始。',
    hottestArticleReads: '次阅读',
    openArticle: '打开文章',
    readArticles: '阅读文章',
    openAdmin: '打开后台',
    articlesHeading: '文章',
    articlesDescription: '这里收录关于产品、写作、系统与 AI 工作流的持续笔记。',
    tagArchive: '标签筛选',
    filterByTag: '按标签浏览',
    allTags: '全部',
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
    navHome: 'Home',
    navArticles: 'Articles',
    navQuestions: 'Questions',
    navAdmin: 'Admin',
    themeDefault: 'Night',
    themeSoft: 'Mist',
    footer: '"AI does not replace thinking. It expands the bandwidth of thought."',
    footerSecondary: 'A quieter interface for reading, drafting, and reasoning.',
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
    homeTitle: 'Start by asking the right question',
    homeDescription: 'A place for notes, systems, and AI workflows worth revisiting over time.',
    hottestArticle: 'Most Read',
    hottestArticleFallback: 'Views are still accumulating. Start with the latest note.',
    hottestArticleReads: 'reads',
    openArticle: 'Open article',
    readArticles: 'Read Articles',
    openAdmin: 'Open Admin',
    articlesHeading: 'Articles',
    articlesDescription: 'An evolving archive of notes on products, systems, writing, and AI workflows.',
    tagArchive: 'Tag filter',
    filterByTag: 'Browse by tag',
    allTags: 'All',
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
