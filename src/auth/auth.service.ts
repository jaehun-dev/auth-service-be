import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'

import { UsersService } from '../users/users.service'
import { User } from '~/users/entities/user.entity'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(user: RegisterDto) {
    const salt = parseInt(this.configService.get('SALT_ROUNDS'))
    const hash = await bcrypt.hash(user.password, salt)

    const newUser = await this.usersService.create({
      ...user,
      password: hash,
    })

    return this.login({ email: newUser.email, id: newUser.id })
  }

  login(user: Pick<User, 'email' | 'id'>) {
    const accessToken = this.createAccessToken(user)
    const refreshToken = this.createRefreshToken(user)

    return { accessToken, refreshToken }
  }

  session(refreshToken: string) {
    const payload = this.verifyToken(refreshToken, 'REFRESH')

    return this.createAccessToken({
      email: payload.email,
      id: payload.sub,
    })
  }

  verifyToken(token: string, tokenType: 'ACCESS' | 'REFRESH') {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get(`JWT_${tokenType}_SECRET`),
      complete: true,
    })

    if (decoded.type !== tokenType) {
      throw new UnauthorizedException(`Invalid token: type is not ${tokenType}`)
    }

    return {
      type: decoded.type,
      email: decoded.payload.email,
      sub: decoded.payload.sub,
    }
  }

  createAccessToken(user: Pick<User, 'email' | 'id'>) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: 'ACCESS',
    }

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN'),
    })
  }

  createRefreshToken(user: Pick<User, 'email' | 'id'>) {
    const payload = {
      email: user.email,
      sub: user.id,
      type: 'REFRESH',
    }

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    })
  }

  extractTokenFromHeader(headers: Headers, tokenType: 'basic' | 'bearer' = 'basic'): string {
    const rawToken = headers.get('authorization')

    if (!rawToken) {
      throw new UnauthorizedException('Unauthorized: No token provided')
    }

    const [type, token] = this.splitRawToken(rawToken)

    if (type !== tokenType) {
      throw new UnauthorizedException(`Invalid token: type is not ${tokenType}`)
    }

    return token
  }

  splitRawToken(rawToken: string): [string, string] {
    const splitedToken = rawToken.split(' ')

    if (splitedToken.length !== 2) {
      throw new UnauthorizedException('Invalid token: length is not 2')
    }

    return splitedToken as [string, string]
  }

  decodeBasicToken(basicToken: string): [string, string] {
    const decoded = Buffer.from(basicToken, 'base64').toString('utf-8').split(':')

    if (decoded.length !== 2) {
      throw new UnauthorizedException('Invalid token: length is not 2')
    }

    return decoded as [string, string]
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email)

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Unauthorized: Invalid password')
    }

    return user
  }
}
