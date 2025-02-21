declare namespace NodeJS {
  interface ProcessEnv {
    /** Environment */
    NODE_ENV: 'development' | 'production'

    /** Database */
    DATABASE_HOST: string
    DATABASE_PORT: string
    DATABASE_USER: string
    DATABASE_PASSWORD: string
    DATABASE_NAME: string

    /** JWT */
    JWT_ACCESS_SECRET: string
    JWT_REFRESH_SECRET: string

    /** Bcrypt */
    SALT_ROUNDS: string
  }
}
