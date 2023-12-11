export class BaseError extends Error {
  constructor(
    message?: string,
    public readonly details?: any,
  ) {
    super(message);
  }
}
