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
        PORT: 4321,
        DATABASE_PATH: '/var/www/self_blog/shared/blog.db',
        BAILIAN_API_KEY: 'sk-sp-9cf573dd284f4f059683ddaae5f26fac',
        BRAVE_SEARCH_API_KEY: 'BSAcSQvu4sym-yFP6wda8dYITwSsgTE',

      }
    }
  ]
};
