import { BaseError } from './base-error';

export class ValidationError extends BaseError {
  constructor(
    public readonly details: Record<string, any>,
    message?: string,
  ) {
    super(message || 'Validation error', details);
  }
}
