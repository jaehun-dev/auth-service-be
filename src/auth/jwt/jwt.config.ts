import { ConfigService } from '@nestjs/config'

import { ConfigModule } from '@nestjs/config'
import { JwtModuleAsyncOptions } from '@nestjs/jwt'

export const jwtConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: configService.get('JWT_EXPIRATION_TIME') },
  }),
  inject: [ConfigService],
}
