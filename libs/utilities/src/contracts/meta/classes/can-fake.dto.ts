import { validate, ValidationError } from 'class-validator';

export class CanFake {
  public static clone<T extends CanFake = CanFake>(target: T): T {
    return JSON.parse(JSON.stringify(target));
  }

  public static fake(): Record<never, unknown> {
    return {};
  }

  public static validate<T extends Record<never, unknown>>(
    target: T,
  ): Promise<ValidationError[]> {
    return validate(target);
  }
}
