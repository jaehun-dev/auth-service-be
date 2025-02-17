import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()

    const refreshToken = req.cookies?.refreshToken

    if (refreshToken == null) {
      throw new UnauthorizedException('Refresh token is missing')
    }

    return true
  }
}
