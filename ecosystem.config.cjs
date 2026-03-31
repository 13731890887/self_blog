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
        DATABASE_PATH: '/var/www/self_blog/shared/blog.db'
      }
    }
  ]
};
