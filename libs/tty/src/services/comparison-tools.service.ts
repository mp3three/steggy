import { FILTER_OPERATIONS } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { FILTER_OPERATIONS_HELP } from '../contracts';
import { PromptService } from './prompt.service';

@Injectable()
export class ComparisonToolsService {
  constructor(private readonly promptService: PromptService) {}

  public async pickOperation(): Promise<FILTER_OPERATIONS> {
    return (await this.promptService.menu<FILTER_OPERATIONS>({
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
