import { DOWN, UP } from '@text-based/utilities';

const UNSORTABLE = new RegExp('[^A-Za-z0-9]', 'g');

/**
 * Regex from ansi-regex package
 */
export function ansiRegex({ onlyFirst = false } = {}) {
  const pattern = [
    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|');
  return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

export function ansiStrip(text = ''): string {
  return text.replace(ansiRegex(), '');
}

export function ansiPadEnd(text: string, amount: number): string {
  const length = ansiStrip(text).length;
  const padding = ' '.repeat(amount - length);
  return text + padding;
}

export function ansiPadStart(text: string, amount: number): string {
  const stripped = ansiStrip(text);
  const padding = stripped.padStart(amount, ' ').slice(stripped.length);
  return text + padding;
}

export function ansiSort(text: string[]): string[] {
  return text.sort((a, b) =>
    ansiStrip(a).replace(UNSORTABLE, '') > ansiStrip(b).replace(UNSORTABLE, '')
      ? UP
      : DOWN,
  );
}

/**
 * Return back the ansi-stripped longest element / line
 */
export function ansiMaxLength(text: string[] | string): number {
  text = Array.isArray(text) ? text : text.split(`\n`);
  return Math.max(...text.map((i) => ansiStrip(i).length));
}
