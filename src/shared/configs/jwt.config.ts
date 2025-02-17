import { JwtModuleAsyncOptions } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

const jwtConfig: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    secret: configService.get('JWT_SECRET'),
    signOptions: { expiresIn: configService.get('JWT_EXPIRATION_TIME') },
  }),
  inject: [ConfigService],
}

export default jwtConfig
