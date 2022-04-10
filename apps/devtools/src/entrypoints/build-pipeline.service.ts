import { AutoLogService, InjectConfig } from '@steggy/boilerplate';
import { QuickScript } from '@steggy/tty';
import { is, SINGLE } from '@steggy/utilities';
import execa from 'execa';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { inc } from 'semver';

type AffectedList = { apps: string[]; libs: string[] };

/**
 * Basic build pipeline.
 * Assume that all the affected packages need a patch version bump, and to be re-published
 */
@QuickScript({
  application: Symbol('build-pipeline'),
})
export class BuildPipelineService {
  constructor(
    @InjectConfig('DRY') private readonly dryRun: boolean = false,
    @InjectConfig('PARALLEL') private readonly parallel: number = SINGLE,
    private readonly logger: AutoLogService,
  ) {}

  public async exec(): Promise<void> {
    const affected = await this.listAffected();
    if (this.dryRun) {
      this.logger.info({ affected });
      return;
    }
    // Bump relevant package.json versions
    this.bump(affected);

    this.logger.info(`Publishing NPM Packages`);
    const publish = execa(`npx`, [
      `nx`,
      `affected`,
      `--target=publish`,
      `--parallel=${this.parallel}`,
    ]);
    publish.stdout.pipe(process.stdout);
    await publish;

    this.logger.info(`Publishing Docker Images`);
    const buildDocker = execa(`npx`, [
      `nx`,
      `affected`,
      `--target=build-docker`,
      `--parallel=${this.parallel}`,
    ]);
    buildDocker.stdout.pipe(process.stdout);
    await buildDocker;
  }

  private bump(affected: AffectedList): void {
    affected.libs.forEach(library => {
      this.logger.info(`Bumping {${library}}`);
      const file = join('libs', library, 'package.json');
      const packageJSON = JSON.parse(readFileSync(file, 'utf8')) as {
        version: string;
      };
      packageJSON.version = inc(packageJSON.version, 'patch');
      writeFileSync(file, JSON.stringify(packageJSON, undefined, '  ') + `\n`);
    });
    affected.apps.forEach(application => {
      this.logger.info(`Bumping {${application}}`);
      const file = join('apps', application, 'package.json');
      if (!existsSync(file)) {
        return;
      }
      const packageJSON = JSON.parse(readFileSync(file, 'utf8')) as {
        version: string;
      };
      if (!is.string(packageJSON.version)) {
        return;
      }
      packageJSON.version = inc(packageJSON.version, 'patch');
      writeFileSync(file, JSON.stringify(packageJSON, undefined, '  ') + `\n`);
    });
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
