/* eslint-disable radar/no-duplicate-string */
import { QuickScript } from '@steggy/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  ScreenService,
  SyncLoggerService,
  TTYModule,
} from '@steggy/tty';
import { eachSeries, is, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';
import JSON from 'comment-json';
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
  imports: [TTYModule],
})
export class BuildPipelineService {
  constructor(
    private readonly applicationManager: ApplicationManagerService,
    private readonly logger: SyncLoggerService,
    private readonly promptService: PromptService,
    private readonly screenService: ScreenService,
  ) {}

  public async exec(): Promise<void> {
    const affected = await this.listAffected();
    if (!is.empty(affected.libs)) {
      await this.bumpLibraries(affected);
    }
    if (is.empty(affected.apps)) {
      return;
    }
    this.screenService.down(2);
    this.screenService.print(chalk.bold.cyan`APPS`);
    affected.apps.forEach(line => {
      const file = join('apps', line, 'package.json');
      if (!existsSync(file)) {
        this.screenService.print(chalk` {yellow - } ${line}`);
        return;
      }
      const { version } = JSON.parse(
        readFileSync(join('apps', line, 'package.json'), 'utf8'),
      ) as PACKAGE;
      this.screenService.print(
        chalk` {yellow - } ${version ? chalk` {gray ${version}} ` : ''}${line}`,
      );
    });
    this.screenService.down();
    this.screenService.print(chalk`Select applications to rebuild`);
    const apps = await this.promptService.listBuild({
      current: affected.apps.map(i => [TitleCase(i), i]),
      items: 'Applications',
      source: [],
    });
    if (!is.empty(apps)) {
      await this.bumpApplications(apps);
    }
    this.logger.warn('DONE!');
  }

  private async bumpApplications(apps: string[]): Promise<void> {
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

  private async bumpLibraries(list: AffectedList) {
    const root = await this.bumpRoot(list);
    if (!root) {
      return;
    }
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
      try {
        const publish = execa(`npx`, [`nx`, `publish`, library]);
        publish.stdout.pipe(process.stdout);
        await publish;
      } catch (error) {
        this.logger.error(error.stderr);
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit();
      }
    });
  }

  private async bumpRoot(affected: AffectedList): Promise<string> {
    const packageJSON = JSON.parse(
      readFileSync('package.json', 'utf8'),
    ) as PACKAGE;
    const newVersion = inc(packageJSON.version, 'patch');
    const proceed = await this.confirmActions(
      affected,
      newVersion,
      packageJSON.version,
    );
    packageJSON.version = newVersion;
    if (!proceed) {
      return ``;
    }
    writeFileSync(
      'package.json',
      JSON.stringify(packageJSON, undefined, '  ') + `\n`,
    );
    return packageJSON.version;
  }

  private async confirmActions(
    { libs }: AffectedList,
    newVersion: string,
    oldVersion: string,
  ) {
    this.applicationManager.setHeader(`Bump Library Versions`);
    this.screenService.down();
    this.screenService.print(
      chalk.bold`{cyan LIBS} {blue ${oldVersion}} {white =>} {blue ${newVersion}}`,
    );
    libs.forEach(line => this.screenService.print(chalk` {yellow - } ${line}`));
    this.screenService.down();
    return await this.promptService.confirm('Upgrade libraries?', true);
  }

  private async listAffected(): Promise<AffectedList> {
    const rawApps = await execa(`npx`, ['nx', 'affected:apps', '--plain']);
    const rawLibs = await execa(`npx`, ['nx', 'affected:libs', '--plain']);
    const libs: string[] = rawLibs.stdout.split(' ');
    const apps: string[] = rawApps.stdout.split(' ');
    return { apps, libs };
  }
}
