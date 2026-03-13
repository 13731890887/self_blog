module.exports = {
  apps: [
    {
      name: 'self-blog-api',
      cwd: './api',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4322,
        DATABASE_PATH: '/var/www/self_blog/shared/blog.db',
        BAILIAN_API_KEY: '',
        BAILIAN_BASE_URL: 'https://coding.dashscope.aliyuncs.com/v1',
        BAILIAN_CHAT_MODEL: 'qwen3.5-plus',
        BAILIAN_MOOD_MODEL: 'qwen3.5-plus',
        BRAVE_SEARCH_API_KEY: '',
        BRAVE_SEARCH_BASE_URL: 'https://api.search.brave.com/res/v1/web/search',
        ADMIN_PASSWORD: '',
        ADMIN_SESSION_SECRET: ''
      }
    }
  ]
};
