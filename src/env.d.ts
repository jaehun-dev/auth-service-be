declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Nest
      NODE_ENV: string
      SERVER_HOST: string
      SERVER_PORT: string

      // Prisma
      DATABASE_URL: string

      // Database
      POSTGRES_USER: string
      POSTGRES_PASSWORD: string
      DATABASE_NAME: string
      DATABASE_PORT: string
    }
  }
}

export {}
