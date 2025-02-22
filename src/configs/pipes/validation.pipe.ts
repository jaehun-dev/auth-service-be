import { ValidationPipe } from '@nestjs/common'

export const validationPipe = new ValidationPipe({
  forbidNonWhitelisted: true,
  transform: true,
})
