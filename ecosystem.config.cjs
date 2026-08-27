module.exports = {
  apps: [
    {
      name: 'alpha-front',
      script: './.output/server/index.mjs',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 3005,
        NITRO_HOST: '127.0.0.1',
        NITRO_PORT: 3005,
        // Override on server if API is elsewhere:
        // NUXT_PUBLIC_API_BASE: 'https://api.example.com/api'
      }
    }
  ]
}
