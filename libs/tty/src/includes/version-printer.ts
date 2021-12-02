import { ACTIVE_APPLICATION, WorkspaceService } from '@ccontour/utilities';
import { INestApplication } from '@nestjs/common';
import { dump } from 'js-yaml';

import { PromptService } from '../services';

/**
 * Attach to preInit
 */
export function VersionPrinter(app: INestApplication): void {
  if (process.argv.includes(`--version`)) {
    const workspace = app.get(WorkspaceService);
    const prompt = app.get(PromptService);
    const application = app.get<symbol>(ACTIVE_APPLICATION);
    workspace.initMetadata();
    const { rootVersion, versions } = workspace.version();
    prompt.print(
      dump({
        ['Application Version']: versions[application.description],
        ['Root Version']: rootVersion,
      }),
    );
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit();
  }
}
