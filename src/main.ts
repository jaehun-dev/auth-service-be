import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { validationPipe } from './configs/pipes/validation.pipe'
import { PrismaClientExceptionFilter } from './configs/filters/prisma-exception.filter'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(cookieParser())

  app.useGlobalPipes(validationPipe)

  const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))

  await app.listen(process.env.SERVER_PORT)
}

bootstrap().catch(console.error)
