import { Controller, Get } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { User } from '@prisma/client'

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users')
  getUsers(): Promise<User[]> {
    return this.prisma.user.findMany()
  }
}
