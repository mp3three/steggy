/* eslint-disable radar/no-identical-functions */
import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { parse } from 'mathjs';

import { DataAggregatorService } from '../vm';

@Injectable()
export class MathService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly dataService: DataAggregatorService,
  ) {}

  public async exec(expression: string): Promise<number> {
    this.logger.debug({ expression }, `Math evaluation`);
    const node = parse(expression);
    const data = await this.dataService.load('number');
    return node.evaluate(data);
  }
}
