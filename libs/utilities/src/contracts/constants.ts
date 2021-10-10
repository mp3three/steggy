export const EMPTY = 0;
export function IsEmpty(
  type: string | Array<unknown> | Set<unknown> | Map<unknown, unknown>,
): boolean {
  if (typeof type === 'string' || Array.isArray(type)) {
    return type.length === EMPTY;
  }
  return type.size === EMPTY;
}
