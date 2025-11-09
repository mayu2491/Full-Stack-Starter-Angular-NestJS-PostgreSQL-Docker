export default () => ({
  port: parseInt(process.env.PORT ?? '3333', 10),
  database: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/fullstack'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'local-jwt-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'local-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d'
  }
});
