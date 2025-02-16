import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { UsersService } from '../users/users.service'
import { SignUpDto } from './dto/sign-up.dto'
import { HASH_ROUNDS } from './constants/hash-round.constant'
import { jwtConstants } from './constants/jwt.constant'
import { User } from 'src/users/entities/user.entity'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async signUp(user: SignUpDto) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS)

    const newUser = await this.usersService.create({
      ...user,
      password: hash,
    })

    return {
      accessToken: this.jwtService.sign(
        {
          email: newUser.email,
          sub: newUser.id,
          type: 'REFRESH',
        },
        {
          secret: jwtConstants.secret,
          expiresIn: jwtConstants.expiresIn.access,
        }
      ),
      refreshToken: this.jwtService.sign(
        {
          email: newUser.email,
          sub: newUser.id,
          type: 'ACCESS',
        },
        {
          secret: jwtConstants.secret,
          expiresIn: jwtConstants.expiresIn.refresh,
        }
      ),
    }
  }

  async signIn(credentials: Pick<User, 'email' | 'password'>) {
    const user = await this.usersService.findOneByEmail(credentials.email)

    return {
      accessToken: this.jwtService.sign(
        {
          email: user.email,
          sub: user.id,
          type: 'REFRESH',
        },
        {
          secret: jwtConstants.secret,
          expiresIn: jwtConstants.expiresIn.access,
        }
      ),
      refreshToken: this.jwtService.sign(
        {
          email: user.email,
          sub: user.id,
          type: 'ACCESS',
        },
        {
          secret: jwtConstants.secret,
          expiresIn: jwtConstants.expiresIn.refresh,
        }
      ),
    }
  }
}
