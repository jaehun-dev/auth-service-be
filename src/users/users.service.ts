import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User } from './entities/user.entity'
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto'
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto'

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  async create(data: CreateUserDto): Promise<User> {
    const parsedData = CreateUserSchema.safeParse(data)

    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.format())
    }

    const newUser = this.usersRepository.create(parsedData.data)

    return await this.usersRepository.save(newUser)
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find()
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } })

    if (user == null) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } })

    if (user == null) {
      throw new NotFoundException(`User with email ${email} not found`)
    }

    return user
  }

  async update(id: number, data: UpdateUserDto): Promise<User> {
    const parsedData = UpdateUserSchema.safeParse(data)

    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.format())
    }

    await this.usersRepository.update(id, parsedData.data)

    return await this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id)
  }
}
