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
        PORT: 4321
      }
    }
  ]
};
