import { AutoLogService, ConfigTypeDTO, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import execa from 'execa';
import { join } from 'path';

import { WorkspaceService } from './workspace.service';

@Injectable()
export class ConfigScannerService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
  ) {}

  @Trace()
  public async scan(application: string): Promise<Set<ConfigTypeDTO>> {
    this.logger.debug(`Preparing scanner`);
    await execa(`nx`, [`build`, application, `--configuration=scan-config`]);

    this.logger.debug(`Scanning`);
    const { stdout } = await execa(`node`, [
      join('dist', 'config-scanner', application, 'main.js'),
    ]);
    const config: Record<string, string[]> = JSON.parse(stdout);

    const out = new Set<ConfigTypeDTO>();
    Object.keys(config).forEach((library) => {
      config[library].forEach((property) => {
        const metadata = this.workspace.METADATA.get(library);
        const metadataConfig = metadata?.configuration[property];
        out.add({
          default: metadataConfig?.default,
          library,
          metadata: metadataConfig,
          property,
        });
      });
    });

    return out;
  }
}
