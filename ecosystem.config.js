module.exports = {
  apps: [{
    name: 'ksarapp',
    script: './server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/ksarapp/err.log',
    out_file: '/var/log/ksarapp/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    restart_delay: 4000,
    max_memory_restart: '1G',
    watch: false, // Set to true only in development
    ignore_watch: ['node_modules', '.env', 'public'],
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
