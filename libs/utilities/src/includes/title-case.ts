/* eslint-disable @typescript-eslint/no-magic-numbers */

export function TitleCase(input: string): string {
  return input
    .split(new RegExp('[ _-]'))
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}
