const FIRST = 0;
const EVERYTHING_ELSE = 1;
export function TitleCase(input: string): string {
  const matches = input.match(new RegExp('[a-z][A-Z]', 'g'));
  if (matches) {
    matches.forEach(i => (input = input.replace(i, [...i].join(' '))));
  }
  return input
    .split(new RegExp('[ _-]'))
    .map(
      (word = '') =>
        `${word.charAt(FIRST).toUpperCase()}${word.slice(EVERYTHING_ELSE)}`,
    )
    .join(' ');
}
