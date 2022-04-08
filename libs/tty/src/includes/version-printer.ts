import { ACTIVE_APPLICATION, WorkspaceService } from '@steggy/boilerplate';
import { INestApplication } from '@nestjs/common';
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
    const { rootVersion, projects: versions } = workspace.version();
    prompt.print(
      dump({
        ['Application Version']: versions[application.description],
        ['Root Version']: rootVersion,
      }),
    );
    show();
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit();
  }
}
