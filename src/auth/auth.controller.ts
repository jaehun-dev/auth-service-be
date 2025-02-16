import { Body, Controller, Post } from '@nestjs/common'

import { AuthService } from './auth.service'
import { SignUpDto } from './dto/sign-up.dto'
import { IsPublic } from 'src/shared/decorator/is-public.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto)
  }
}
