/* eslint-disable radar/no-identical-functions */
import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { parse } from 'mathjs';

import { DataAggregatorService } from './data-aggregator.service';

@Injectable()
export class MathService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly dataService: DataAggregatorService,
  ) {}

  public async exec(expression: string): Promise<number> {
    this.logger.debug({ expression }, `Math evaluation`);
    const node = parse(expression);
    return node.evaluate(await this.dataService.exec());
  }
}
