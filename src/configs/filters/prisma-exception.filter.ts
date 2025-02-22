/**
 * @see https://www.prisma.io/blog/nestjs-prisma-error-handling-7D056s1kOop2#nestjs-global-exception-filter
 */

import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message)

    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const message = exception.message.replace(/\n/g, '')

    switch (exception.code) {
      case 'P2025': {
        const statusCode = HttpStatus.NOT_FOUND
        response.status(statusCode).json({
          statusCode,
          message,
        })
        break
      }
      case 'P2003': {
        const statusCode = HttpStatus.BAD_REQUEST
        response.status(statusCode).json({
          statusCode,
          message,
        })
        break
      }
      case 'P2002': {
        const statusCode = HttpStatus.CONFLICT
        response.status(statusCode).json({
          statusCode,
          message,
        })
        break
      }
      default:
        super.catch(exception, host)
        break
    }
  }
}
