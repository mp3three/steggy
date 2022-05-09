import { INestApplication } from '@nestjs/common';
import { ACTIVE_APPLICATION, WorkspaceService } from '@steggy/boilerplate';
import { show } from 'cli-cursor';
import { dump } from 'js-yaml';

import { ScreenService } from '../services';

/**
 * Attach to preInit
 */
export function VersionPrinter(app: INestApplication): void {
  if (process.argv.includes(`--version`)) {
    const workspace = app.get(WorkspaceService);
    const prompt = app.get(ScreenService);
    const application = app.get<symbol>(ACTIVE_APPLICATION);
    workspace.initMetadata();
    const { projects: versions } = workspace.version();
    prompt.print(
      dump({
        ['Application Version']: versions[application.description],
      }),
    );
    show();
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit();
  }
}
