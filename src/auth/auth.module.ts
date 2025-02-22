import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { UsersModule } from '../users/users.module'
import { jwtConfig } from './jwt/jwt.config'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule, JwtModule.register(jwtConfig), UsersModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
