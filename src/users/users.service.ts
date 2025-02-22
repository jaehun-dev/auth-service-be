import { Injectable, NotFoundException } from '@nestjs/common'
import { User } from '@prisma/client'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from '~/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: CreateUserDto): Promise<User> {
    return await this.prismaService.user.create({
      data: user,
    })
  }

  async findAll(): Promise<User[]> {
    return await this.prismaService.user.findMany()
  }

  async findOne(id: User['id']): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async findOneByEmail(email: User['email']): Promise<User | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    return user
  }

  async update(id: User['id'], user: UpdateUserDto): Promise<User> {
    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: user,
    })

    if (user === null) {
      throw new NotFoundException('User not found')
    }

    return updatedUser
  }

  async remove(id: User['id']): Promise<void> {
    /**
     * findOne -> delete 시 동시성 문제 발생.
     *
     * Prisma 에서 제공하는 오류 코드 사용 (prisma-exception.fitler.ts 참고)
     *
     * {
     *   code: 'P2025',
     *   clientVersion: '6.4.1',
     *   meta: {
     *     modelName: 'User',
     *     cause: 'Record to delete does not exist.'
     *   }
     * }
     */
    await this.prismaService.user.delete({
      where: { id },
    })
  }
}
