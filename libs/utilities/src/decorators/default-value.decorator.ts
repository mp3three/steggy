import { Transform } from 'class-transformer';

export function DefaultValue(defaultValue: unknown): PropertyDecorator {
  const stringified = JSON.stringify(defaultValue);
  return Transform(({ value }) => value ?? JSON.parse(stringified));
}
