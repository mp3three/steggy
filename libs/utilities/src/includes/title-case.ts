const ALL_CAPS = 3;
const FIRST = 0;
const EVERYTHING_ELSE = 1;
const excluded = ['fan', 'day'];
export function TitleCase(input: string, doCaps = true): string {
  return input
    .split(new RegExp('[ _-]'))
    .map((word) =>
      word.length === ALL_CAPS && doCaps && !excluded.includes(word)
        ? word.toUpperCase()
        : `${word.charAt(FIRST).toUpperCase()}${word.slice(EVERYTHING_ELSE)}`,
    )
    .join(' ');
}
