const ALL_CAPS = 3;
const FIRST = 0;
const EVERYTHING_ELSE = 1;
export function TitleCase(input: string): string {
  return input
    .split(new RegExp('[ _-]'))
    .map((word) =>
      word.length === ALL_CAPS
        ? word.toUpperCase()
        : `${word.charAt(FIRST).toUpperCase()}${word.slice(EVERYTHING_ELSE)}`,
    )
    .join(' ');
}
