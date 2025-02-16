import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Reflector } from '@nestjs/core'

import { jwtConstants } from '../constants/jwt.constant'
import { IS_PUBLIC_KEY } from 'src/shared/decorator/is-public.decorator'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class BearerAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const rawToken = request.headers['authorization']

    if (!rawToken) {
      throw new UnauthorizedException('Unauthorized: No token provided')
    }

    const splitedToken = rawToken.split(' ')

    if (splitedToken.length !== 2) {
      throw new UnauthorizedException('Invalid token: length is not 2')
    }

    const [type, token] = splitedToken

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid token: type is not Bearer')
    }

    const payload = await this.jwtService.verifyAsync(token, {
      secret: jwtConstants.secret,
    })

    const user = await this.usersService.findOneByEmail(payload.email)

    request['user'] = user
    request['token'] = token
    request['tokenType'] = type

    return true
  }
}
