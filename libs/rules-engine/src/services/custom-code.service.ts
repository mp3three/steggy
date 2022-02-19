import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@automagical/boilerplate';
import { VM } from 'vm2';

import { CustomCodeDTO } from '../contracts';

@Injectable()
export class CustomCodeService {
  constructor(private readonly logger: AutoLogService) {}

  public async test(comparison: CustomCodeDTO): Promise<boolean> {
    const result = await new VM({
      eval: false,
      fixAsync: true,
      sandbox: {
        logger: this.logger,
      },
      timeout: 250,
      wasm: false,
    }).run(comparison.code);
    return result;
  }
}
