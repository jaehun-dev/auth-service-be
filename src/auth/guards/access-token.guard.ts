import { Injectable } from '@nestjs/common'
import { ExecutionContext } from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common'

import { BearerAuthGuard } from './bearer-auth.guard'

@Injectable()
export class AccessTokenGuard extends BearerAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context)

    const req = context.switchToHttp().getRequest()

    if (req.isRoutePublic) {
      return true
    }

    if (req.tokenType !== 'ACCESS') {
      throw new UnauthorizedException('Unauthorized: Invalid token type')
    }

    return true
  }
}
