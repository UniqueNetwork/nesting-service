import { BaseExceptionFilter } from '@nestjs/core';
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { ValidationError } from '../../errors';
import { BaseError } from '../../errors/base-error';

type HttpExceptionClass = { new (response: any): HttpException };

const httpResponseErrorMap = new Map<string, HttpExceptionClass>();

httpResponseErrorMap.set(ValidationError.name, BadRequestException);

function createRestException(exception: Error) {
  const response = {
    error: getErrorData(exception),
  };
  if (httpResponseErrorMap.has(exception.constructor.name)) {
    const ErrorClass = httpResponseErrorMap.get(
      exception.constructor.name,
    ) as HttpExceptionClass;
    return new ErrorClass(response);
  }

  return new BadRequestException(response);
}

function getErrorData(exception: Error) {
  if (exception instanceof BaseError) {
    return {
      name: exception.name,
      message: exception.message,
      details: exception.details,
    };
  } else {
    if (exception instanceof HttpException) {
      return exception;
    }

    console.error(exception);
    return {
      name: 'Unhandled error',
      message: `${exception.name}: ${exception.message}`,
    };
  }
}

@Catch(BaseError, Error)
export class BaseExceptionsFilter extends BaseExceptionFilter {
  catch(exception: BaseError, host: ArgumentsHost) {
    super.catch(createRestException(exception), host);
  }
}

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(_exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.render('not-found');
  }
}
