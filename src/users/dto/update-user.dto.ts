import { IsEmail, IsOptional, IsString } from 'class-validator'
import { Prisma } from '@prisma/client'

export class UpdateUserDto implements Prisma.UserUpdateInput {
  @IsEmail()
  @IsOptional()
  email?: string

  @IsString()
  @IsOptional()
  password?: string
}
