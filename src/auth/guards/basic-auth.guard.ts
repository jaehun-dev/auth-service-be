import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import { AuthService } from '../auth.service'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    const rawToken = req.headers['authorization']

    if (!rawToken) {
      throw new UnauthorizedException('Unauthorized: No token provided')
    }

    const splitedToken = rawToken.split(' ')

    if (splitedToken.length !== 2) {
      throw new UnauthorizedException('Invalid token: length is not 2')
    }

    const [type, token] = splitedToken

    if (type !== 'Basic') {
      throw new UnauthorizedException('Invalid token: type is not Basic')
    }

    const splitedEncodedToken = Buffer.from(token, 'base64').toString('utf-8').split(':')

    if (splitedEncodedToken.length !== 2) {
      throw new UnauthorizedException('Invalid token: length is not 2')
    }

    const [email, password] = splitedEncodedToken

    const user = await this.usersService.findOneByEmail(email)

    console.log(user)

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Unauthorized: Invalid password')
    }

    req.user = user

    return true
  }
}
