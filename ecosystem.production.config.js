module.exports = {
  apps: [
    {
      name: 'lasa-production',
      script: 'npm',
      args: 'start',
      cwd: __dirname,
      env_production: {
        NODE_ENV: 'production'
      },
      // adjust max_restarts, instances etc. if needed
    }
  ]
}
