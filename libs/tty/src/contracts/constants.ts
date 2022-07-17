import chalk from 'chalk';

export const TABLE_PARTS = Object.fromEntries(
  Object.entries({
    bottom: '─',
    bottom_left: '└',
    bottom_mid: '┴',
    bottom_right: '┘',
    left: '│',
    left_mid: '├',
    mid: '─',
    mid_mid: '┼',
    middle: '│',
    right: '│',
    right_mid: '┤',
    top: '─',
    top_left: '┌',
    top_mid: '┬',
    top_right: '┐',
  }).map(([key, value]) => [key, chalk.gray.dim(value)]),
);
