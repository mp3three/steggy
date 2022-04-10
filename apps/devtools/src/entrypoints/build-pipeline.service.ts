import { AutoLogService, InjectConfig } from '@steggy/boilerplate';
import { QuickScript } from '@steggy/tty';
import execa from 'execa';
import { readFileSync, writeFile, writeFileSync } from 'fs';
import { join } from 'path';
import { inc } from 'semver';

/**
 * Basic build pipeline.
 * Assume that all the affected packages need a patch version bump, and to be re-published
 */
@QuickScript({
  application: Symbol('build-pipeline'),
})
export class BuildPipelineService {
  constructor(
    @InjectConfig('DRY_RUN') private readonly dryRun: boolean = false,
    private readonly logger: AutoLogService,
  ) {}

  public async exec(): Promise<void> {
    const affected = await this.listAffected();
    if (this.dryRun) {
      this.logger.info({ affected });
      return;
    }
    affected.libs.forEach(library => {
      const file = join('libs', library, 'package.json');
      const packageJSON = JSON.parse(readFileSync(file, 'utf8')) as {
        version: string;
      };
      packageJSON.version = inc(packageJSON.version, 'patch');
      writeFileSync(file, JSON.stringify(packageJSON, undefined, '  '));
    });
    affected.libs.forEach(application => {
      const file = join('apps', application, 'package.json');
      const packageJSON = JSON.parse(readFileSync(file, 'utf8')) as {
        version: string;
      };
      packageJSON.version = inc(packageJSON.version, 'patch');
      writeFileSync(file, JSON.stringify(packageJSON, undefined, '  '));
    });
    // console.log(affected);
    // update.stdout.pipe(process.stdout);
  }

  private async listAffected(): Promise<{ apps: string[]; libs: string[] }> {
    const rawApps = await execa(`npx`, ['nx', 'affected:apps', '--plain']);
    const rawLibs = await execa(`npx`, ['nx', 'affected:libs', '--plain']);
    const libs: string[] = rawLibs.stdout.split(' ');
    const apps: string[] = rawApps.stdout.split(' ');
    return {
      apps,
      libs,
    };
  }
}
