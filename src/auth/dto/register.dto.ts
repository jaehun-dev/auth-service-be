import { Prisma } from '@prisma/client'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class RegisterDto implements Prisma.UserCreateInput {
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}
