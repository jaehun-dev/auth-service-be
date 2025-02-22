import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { User } from '@prisma/client'
import { UsersService } from '../users/users.service'
import { RegisterDto } from './dto/register.dto'
import { CustomJwtPayload } from './guards/refresh-token.guard'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(user: RegisterDto) {
    const salt = parseInt(this.configService.get('SALT_ROUNDS')!)

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

  async session(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken, 'REFRESH')

    return this.createAccessToken({
      email: payload.email,
      id: payload.sub,
    })
  }

  async verifyToken(token: string, tokenType: 'ACCESS' | 'REFRESH') {
    const { payload } = await this.jwtService.verifyAsync<{ payload: CustomJwtPayload }>(token, {
      secret: this.configService.get(`JWT_${tokenType}_SECRET`),
      complete: true,
    })

    if (payload.type !== tokenType) {
      throw new UnauthorizedException(`Invalid token: type is not ${tokenType}`)
    }

    return {
      type: payload.type,
      email: payload.email,
      sub: payload.sub,
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
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION_TIME'),
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
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION_TIME'),
    })
  }

  extractTokenFromHeader(rawToken: string, tokenType: 'Basic' | 'Bearer' = 'Basic'): string {
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

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOneByEmail(email)

    if (user === null) {
      throw new UnauthorizedException('Unauthorized: User not found')
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Unauthorized: Invalid password')
    }

    return user
  }
}
