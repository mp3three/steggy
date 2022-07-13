import { INestApplication } from '@nestjs/common';
import { ACTIVE_APPLICATION, WorkspaceService } from '@steggy/boilerplate';
import { show } from 'cli-cursor';
import { dump } from 'js-yaml';
import { argv, exit } from 'process';

import { ScreenService } from '../services';

/**
 * Attach to preInit
 */
export function VersionPrinter(app: INestApplication): void {
  if (argv.includes(`--version`)) {
    const workspace = app.get(WorkspaceService);
    const prompt = app.get(ScreenService);
    const application = app.get<symbol>(ACTIVE_APPLICATION);
    workspace.initMetadata();
    const { projects: versions } = workspace.version();
    prompt.printLine(
      dump({
        ['Application Version']: versions[application.description],
      }),
    );
    show();
    exit();
  }
}
