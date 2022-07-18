import { INestApplication, Injectable } from '@nestjs/common';
import { exit } from 'process';

import { SCAN_CONFIG } from '../config';
import { InjectConfig } from '../decorators/injectors/inject-config.decorator';
import { BootstrapOptions, ScanConfig } from '../includes';

@Injectable()
export class ConfigScanner {
  constructor(
    @InjectConfig(SCAN_CONFIG) private readonly scanConfig: boolean,
  ) {}

  protected rewire(app: INestApplication, options: BootstrapOptions): void {
    if (!this.scanConfig) {
      return;
    }
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(ScanConfig(app, options?.config)));
    exit();
  }
}
