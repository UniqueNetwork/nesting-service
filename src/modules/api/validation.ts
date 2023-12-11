import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from '../../errors';

export const createValidationPipe = () => {
  return new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: false },
    exceptionFactory: (errors) => new ValidationError({ errors }),
    validateCustomDecorators: true,
    forbidUnknownValues: false,
  });
};
