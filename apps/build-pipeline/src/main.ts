/* eslint-disable radar/no-duplicate-string */
import { AutoLogService, QuickScript } from '@steggy/boilerplate';
import { eachSeries, is } from '@steggy/utilities';
import execa from 'execa';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { inc } from 'semver';

type AffectedList = { apps: string[]; libs: string[] };
type PACKAGE = { version: string };
/**
 * Basic build pipeline.
 * Assume that all the affected packages need a patch version bump, and to be re-published
 */
@QuickScript({
  application: Symbol('build-pipeline'),
  bootstrap: {
    config: {
      libs: { boilerplate: { LOG_LEVEL: 'debug' } },
    },
  },
})
export class BuildPipelineService {
  constructor(private readonly logger: AutoLogService) {}

  public async exec(): Promise<void> {
    const affected = await this.listAffected();
    if (!is.empty(affected.libs)) {
      await this.bumpLibraries();
    }
    await this.bumpApplications(affected);
  }

  private async bumpApplications({ apps }: AffectedList): Promise<void> {
    apps.forEach(application => {
      const file = join('apps', application, 'package.json');
      if (!existsSync(file)) {
        return;
      }
      const packageJSON = JSON.parse(readFileSync(file, 'utf8')) as PACKAGE;
      if (!is.string(packageJSON.version)) {
        return;
      }
      const update = inc(packageJSON.version, 'patch');
      this.logger.debug(
        `[${application}] {${packageJSON.version}} => {${update}}`,
      );
      packageJSON.version = update;
      writeFileSync(file, JSON.stringify(packageJSON, undefined, '  ') + `\n`);
    });
    await eachSeries(apps, async app => {
      this.logger.info(`[${app}] publishing`);
      const buildDocker = execa(`npx`, [`nx`, `publish`, app]);
      buildDocker.stdout.pipe(process.stdout);
      await buildDocker;
    });
  }

  private async bumpLibraries() {
    const root = this.bumpRoot();
    const { projects } = JSON.parse(readFileSync('workspace.json', 'utf8')) as {
      projects: Record<string, string>;
    };
    const libraries = Object.entries(projects)
      .filter(([, path]) => path.startsWith('lib'))
      .map(([library]) => library);
    libraries.forEach(library => {
      const file = join('libs', library, 'package.json');
      const packageJSON = JSON.parse(readFileSync(file, 'utf8')) as PACKAGE;
      this.logger.debug(`[${library}] {${packageJSON.version}} => {${root}}`);
      packageJSON.version = root;
      writeFileSync(file, JSON.stringify(packageJSON, undefined, '  ') + `\n`);
    });
    await eachSeries(libraries, async library => {
      this.logger.info(`[${library}] publishing`);
      const publish = execa(`npx`, [`nx`, `publish`, library]);
      publish.stdout.pipe(process.stdout);
      await publish;
    });
  }

  private bumpRoot(): string {
    const packageJSON = JSON.parse(
      readFileSync('package.json', 'utf8'),
    ) as PACKAGE;
    packageJSON.version = inc(packageJSON.version, 'patch');
    writeFileSync(
      'package.json',
      JSON.stringify(packageJSON, undefined, '  ') + `\n`,
    );
    return packageJSON.version;
  }

  private async listAffected(): Promise<AffectedList> {
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
