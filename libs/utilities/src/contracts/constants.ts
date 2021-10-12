export const EMPTY = 0;
export function IsEmpty(
  type: string | Array<unknown> | Set<unknown> | Map<unknown, unknown>,
): boolean {
  if (typeof type === 'string' || Array.isArray(type)) {
    return type.length === EMPTY;
  }
  if (type instanceof Map || type instanceof Set) {
    return type.size === EMPTY;
  }
  return true;
}
