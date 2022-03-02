import { FILTER_OPERATIONS } from '@automagical/utilities';
import chalk from 'chalk';

const dateMessage = [
  `Compare 2 things relative to each other.`,
  `Numbers are `,
].join(`\n`);
export const FILTER_OPERATIONS_HELP = new Map<FILTER_OPERATIONS, string>([
  [
    FILTER_OPERATIONS.eq,
    [
      chalk`Attempt to compare 2 values for equality. Values will be coerced to {yellow number} / {magenta boolean} / {gray null} as needed`,
      ` `,
      chalk` {cyan -} {blue y/true} = {magenta true}`,
      chalk` {cyan -} {blue n/false} = {magenta false}`,
    ].join(`\n`),
  ],
  [FILTER_OPERATIONS.gt, dateMessage],
  [
    FILTER_OPERATIONS.ne,
    [chalk`Attempt to compare 2 values inequality`].join(`\n`),
  ],
  [
    FILTER_OPERATIONS.regex,
    [chalk`Does the property conform to a regular expression?`].join(`\n`),
  ],
  [
    FILTER_OPERATIONS.elem,
    [
      chalk`{cyan - } {bold.gray comparison value} [{blue banana}, {blue apple}, {blue kitten}] {green elem} {bold.gray value} {blue kitten}`,
      chalk`{cyan - } {bold.gray comparison value} [{blue banana}, {blue apple}, {blue kitten}] {green elem} {bold.gray value} {blue vulture}`,
    ].join(`\n`),
  ],
]);
