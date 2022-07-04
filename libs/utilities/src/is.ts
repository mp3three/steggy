import { EMPTY, EVEN, START } from './utilities';

// TODO: declaration merging to allow other libs to create definitions here
/**
 * type testing and basic conversion tools
 */
export class is {
  public static hash = {
    string(text: string): string {
      let hash = START;
      for (let i = START; i < text.length; i++) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        hash = (hash << 5) - hash + text.codePointAt(i);
        hash = Math.trunc(hash);
      }
      return hash.toString();
    },
  };

  public static boolean(test: unknown): test is boolean {
    return typeof test === 'boolean';
  }

  public static date(test: unknown): test is Date {
    return test instanceof Date;
  }

  public static empty(
    type:
      | string
      | Array<unknown>
      | Set<unknown>
      | Map<unknown, unknown>
      | object,
  ): boolean {
    if (is.string(type) || Array.isArray(type)) {
      return type.length === EMPTY;
    }
    if (type instanceof Map || type instanceof Set) {
      return type.size === EMPTY;
    }
    if (is.object(type)) {
      return Object.keys(type).length === EMPTY;
    }
    return true;
  }

  public static even(test: number): boolean {
    return test % EVEN === EMPTY;
  }

  public static function<
    T extends (
      ...parameters: unknown[]
    ) => unknown | void | Promise<unknown | void>,
  >(test: unknown): test is T {
    return typeof test === 'function';
  }

  public static number(test: unknown): test is number {
    return typeof test === 'number' && !Number.isNaN(test);
  }

  public static object(test: unknown): test is object {
    return typeof test === 'object' && test !== null && !Array.isArray(test);
  }

  public static string(test: unknown): test is string {
    return typeof test === 'string';
  }

  public static symbol(test: unknown): test is symbol {
    return typeof test === 'symbol';
  }

  public static undefined(test: unknown): test is undefined {
    return typeof test === 'undefined';
  }

  public static unique<T>(out: T[]): T[] {
    // Technically this isn't an "is"... but close enough
    return out.filter((item, index, array) => array.indexOf(item) === index);
  }
}
