import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from '../../errors';

export const createValidationPipe = () => {
  return new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => new ValidationError({ errors }),
    validateCustomDecorators: true,
    forbidUnknownValues: false,
  });
};
