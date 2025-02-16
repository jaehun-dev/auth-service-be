import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common'

import { AuthService } from './auth.service'
import { SignUpDto } from './dto/sign-up.dto'
import { IsPublic } from 'src/shared/decorator/is-public.decorator'
import { RefreshTokenGuard } from './guards/refresh-token.guard'
import { BasicAuthGuard } from './guards/basic-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto)
  }

  @IsPublic()
  @Post('sign-in')
  @UseGuards(BasicAuthGuard)
  signIn(@Headers('authorization') rawToken: string) {
    const [, token] = rawToken.split(' ')
    const [email, password] = Buffer.from(token, 'base64').toString('utf-8').split(':')

    return this.authService.signIn({ email, password })
  }

  @IsPublic()
  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  refreshToken(@Headers('authorization') rawToken: string) {
    const [, token] = rawToken.split(' ')

    return this.authService.refreshToken(token)
  }

  @IsPublic()
  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  accessToken(@Headers('authorization') rawToken: string) {
    const [, token] = rawToken.split(' ')

    return this.authService.accessToken(token)
  }
}
