const ALL_CAPS = 3;
const FIRST = 0;
const EVERYTHING_ELSE = 1;
const excluded = new Set(['fan', 'day']);
export function TitleCase(input: string, doCaps = true): string {
  const matches = input.match(new RegExp('[a-z][A-Z]', 'g'));
  if (matches) {
    matches.forEach((i) => (input = input.replace(i, [...i].join(' '))));
  }
  return input
    .split(new RegExp('[ _-]'))
    .map((word = '') =>
      word.length === ALL_CAPS && doCaps && !excluded.has(word)
        ? word.toUpperCase()
        : `${word.charAt(FIRST).toUpperCase()}${word.slice(EVERYTHING_ELSE)}`,
    )
    .join(' ');
}
