import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

export interface CustomJwtPayload {
  email: string
  type: string
  sub: string
}

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()
    const refreshToken = req.cookies?.refresh_token

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing')
    }

    try {
      const payload = await this.jwtService.verifyAsync<CustomJwtPayload>(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      })

      if (payload.type !== 'REFRESH') {
        throw new UnauthorizedException('Invalid token type')
      }

      req['user'] = payload

      return true
    } catch (err) {
      console.log(err)
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}
