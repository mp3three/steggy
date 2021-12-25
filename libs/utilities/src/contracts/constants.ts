import { is } from '.';

export const EMPTY = 0;

/**
 * The general purpose sanity checker that keeps the linter happiest
 */
export function IsEmpty(
  type: string | Array<unknown> | Set<unknown> | Map<unknown, unknown>,
): boolean {
  if (is.string(type) || Array.isArray(type)) {
    return type.length === EMPTY;
  }
  if (type instanceof Map || type instanceof Set) {
    return type.size === EMPTY;
  }
  return true;
}
