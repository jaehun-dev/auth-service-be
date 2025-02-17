import { Body, Controller, Headers, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { BasicAuthGuard } from './guards/basic-auth.guard'
import { RefreshTokenGuard } from './guards/refresh-token.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.register(registerDto)

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return res.json({ accessToken })
  }

  @Post('login')
  @UseGuards(BasicAuthGuard)
  async login(@Headers('authorization') headers, @Res() res: Response) {
    const rawToken = this.authService.extractTokenFromHeader(headers)

    const [email, password] = this.authService.decodeBasicToken(rawToken)

    const credentials = await this.authService.validateUser(email, password)

    const { accessToken, refreshToken } = await this.authService.login(credentials)

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return res.json({ accessToken })
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('refresh_token')

    return res.json({ message: 'Logged Out' })
  }

  @Post('session')
  @UseGuards(RefreshTokenGuard)
  async session(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken

    const accessToken = this.authService.session(refreshToken)

    return res.json({ accessToken })
  }
}
