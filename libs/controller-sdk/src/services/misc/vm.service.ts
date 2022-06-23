import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import dayjs from 'dayjs';
import { VM } from 'vm2';

import { DataAggregatorService } from './data-aggregator.service';

@Injectable()
export class VMService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly dataAggregator: DataAggregatorService,
  ) {}

  public async exec<T>(
    code: string,
    parameters: Record<string, unknown> = {},
  ): Promise<T> {
    return await new VM({
      eval: false,
      fixAsync: true,
      sandbox: {
        dayjs,
        ...(await this.dataAggregator.exec()),
        ...parameters,
      },
      timeout: 250,
      wasm: false,
    }).run(code);
  }
}
