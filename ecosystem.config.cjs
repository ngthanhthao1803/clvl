module.exports = {
  apps: [
    {
      name: "clvl-api",
      cwd: "/var/www/clvl/apps/api",
      script: "src/server.js",
      interpreter: "node",
      interpreter_args: "--env-file=.env",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
    },
    {
      name: "clvl-web",
      cwd: "/var/www/clvl/apps/web/.next/standalone/apps/web",
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        HOSTNAME: "127.0.0.1",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "500M",
    },
  ],
};
