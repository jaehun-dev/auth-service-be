import { IsEmail, IsString } from 'class-validator'
import { Prisma } from '@prisma/client'

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsEmail()
  email: string

  @IsString()
  password: string
}
