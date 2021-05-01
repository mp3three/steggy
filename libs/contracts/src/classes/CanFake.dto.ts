import { validate, ValidationError } from '@automagical/validation';

export class CanFake {
  // #region Public Static Methods

  public static fake(): Record<never, unknown> {
    return {};
  }

  public static validate<T extends Record<never, unknown>>(
    obj: T,
  ): Promise<ValidationError[]> {
    return validate(obj);
  }

  // #endregion Public Static Methods
}
