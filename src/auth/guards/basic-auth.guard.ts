import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'

import { AuthService } from '~/auth/auth.service'

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const ctx = context.switchToHttp()
    const req = ctx.getRequest<Request>()

    if (req.headers?.authorization == null) {
      throw new UnauthorizedException('Unauthorized: No token provided')
    }

    const rawToken = this.authService.extractTokenFromHeader(req.headers.authorization)

    const [email, password] = this.authService.decodeBasicToken(rawToken)

    const user = await this.authService.validateUser(email, password)

    req.user = user

    return true
  }
}
