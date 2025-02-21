import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

import { AuthService } from '../auth.service'

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()

    const rawToken = this.authService.extractTokenFromHeader(req.headers)

    const [email, password] = this.authService.decodeBasicToken(rawToken)

    const user = await this.authService.validateUser(email, password)

    req.user = user

    return true
  }
}
