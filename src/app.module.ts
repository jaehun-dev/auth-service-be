import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import typeOrmConfig from './shared/configs/type-orm.config'

@Module({
  imports: [TypeOrmModule.forRootAsync(typeOrmConfig), AuthModule],
})
export class AppModule {}
