declare module 'express' {
  interface Request {
    /**
     * Custom Request object
     */
    user: User

    cookies: {
      refresh_token?: string
    }
  }
}

export {}
