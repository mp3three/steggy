import { Injectable } from '@nestjs/common';
import { FILTER_OPERATIONS } from '@steggy/utilities';
import chalk from 'chalk';

import { PromptService } from './prompt.service';

const dateMessage = [
  `Compare 2 things relative to each other.`,
  `Numbers are `,
].join(`\n`);
const FILTER_OPERATIONS_HELP = new Map<FILTER_OPERATIONS, string>([
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

@Injectable()
export class ComparisonToolsService {
  constructor(private readonly prompt: PromptService) {}

  public async pickOperation(): Promise<FILTER_OPERATIONS> {
    return (await this.prompt.menu<FILTER_OPERATIONS>({
      keyMap: {},
      right: [
        {
          entry: ['Equals', FILTER_OPERATIONS.eq],
          helpText: FILTER_OPERATIONS_HELP.get(FILTER_OPERATIONS.eq),
        },
        {
          entry: ['Not Equals', FILTER_OPERATIONS.ne],
          helpText: FILTER_OPERATIONS_HELP.get(FILTER_OPERATIONS.ne),
        },
        {
          entry: ['Greater Than', FILTER_OPERATIONS.gt],
          helpText: FILTER_OPERATIONS_HELP.get(FILTER_OPERATIONS.gt),
        },
        {
          entry: ['Less Than', FILTER_OPERATIONS.lt],
          helpText: FILTER_OPERATIONS_HELP.get(FILTER_OPERATIONS.lt),
        },
        {
          entry: ['Greater Than / Equals', FILTER_OPERATIONS.gte],
          helpText: FILTER_OPERATIONS_HELP.get(FILTER_OPERATIONS.gte),
        },
        {
          entry: ['Less Than / Equals', FILTER_OPERATIONS.lte],
          helpText: FILTER_OPERATIONS_HELP.get(FILTER_OPERATIONS.lte),
        },
        {
          entry: ['In List', FILTER_OPERATIONS.in],
          helpText: FILTER_OPERATIONS_HELP.get(FILTER_OPERATIONS.in),
        },
        {
          entry: ['Not In List', FILTER_OPERATIONS.nin],
          helpText: FILTER_OPERATIONS_HELP.get(FILTER_OPERATIONS.nin),
        },
        {
          entry: ['Regex Match', FILTER_OPERATIONS.regex],
          helpText: FILTER_OPERATIONS_HELP.get(FILTER_OPERATIONS.regex),
        },
        {
          entry: ['Contains Value', FILTER_OPERATIONS.elem],
          helpText: FILTER_OPERATIONS_HELP.get(FILTER_OPERATIONS.elem),
        },
      ],
    })) as FILTER_OPERATIONS;
  }
}
