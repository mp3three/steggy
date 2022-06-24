import { Injectable } from '@nestjs/common';
import { AutoLogService, InjectConfig } from '@steggy/boilerplate';
import { is } from '@steggy/utilities';
import dayjs from 'dayjs';
import { VM } from 'vm2';

import { VM_TIMEOUT } from '../../config';
import { DataAggregatorService } from './data-aggregator.service';

@Injectable()
export class VMService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly dataAggregator: DataAggregatorService,
    @InjectConfig(VM_TIMEOUT) private readonly timeout: number,
  ) {}

  /**
   * Execute the user provided code inside a wrapper function.
   * Whatever the user returns (via the normal return keyword), will be returned by this function.
   */
  public async exec<T>(
    code: string,
    parameters: Record<string, unknown> = {},
  ): Promise<T> {
    // Seems like the result of the final command to be executed is what gets sent out
    code = `const __wrapper = async function(){${code}};\n__wrapper();`;
    return await new VM({
      // Should allow for dealing with some async work
      // I'm really not sure what async work there is to do though in this context
      allowAsync: true,
      // Already doing something that's kinda dangerous
      // Let's not 🦶🔫
      eval: false,
      // Data going into the global object
      sandbox: {
        // Load all dynamic data, and provide
        ...(await this.dataAggregator.load()),
        // Variables related to the local flow
        ...parameters,
        // libraries & utils
        dayjs,
        is,
        logger: this.logger,
      },
      timeout: this.timeout,
      // No web assembly... seriously, why?
      wasm: false,
    }).run(code);
  }
}
