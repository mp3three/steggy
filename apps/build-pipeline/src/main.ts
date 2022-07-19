/* eslint-disable radar/no-duplicate-string */
import {
  InjectConfig,
  PACKAGE_FILE,
  PackageJsonDTO,
  QuickScript,
} from '@steggy/boilerplate';
import {
  PromptService,
  ScreenService,
  SyncLoggerService,
  TTYModule,
} from '@steggy/tty';
import { eachSeries, is, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';
import JSON from 'comment-json';
import dayjs from 'dayjs';
import execa from 'execa';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { exit } from 'process';
import { inc } from 'semver';

type AffectedList = { apps: string[]; libs: string[] };
type PACKAGE = { version: string };

/**
 * Basic build pipeline.
 * Assume that all the affected packages need a patch version bump, and to be re-published
 */
@QuickScript({
  application: Symbol('build-pipeline'),
  imports: [TTYModule],
})
export class BuildPipelineService {
  constructor(
    private readonly logger: SyncLoggerService,
    private readonly prompt: PromptService,
    private readonly screen: ScreenService,
    @InjectConfig('RUN_AFTER', {
      description:
        'Target script to execute after the pipeline finishes. Kick off deployment scripts or whatever is needed',
      type: 'string',
    })
    private readonly runAfter: string,
    @InjectConfig('NON_INTERACTIVE', {
      default: false,
      description: 'Process without user interactions (say yes to everything)',
      type: 'boolean',
    })
    private readonly nonInteractive: boolean,
    @InjectConfig('ALL', {
      default: false,
      description: 'Do not look for affected, just run everything',
      type: 'boolean',
    })
    private readonly runAll: boolean,
    @InjectConfig('RUN', {
      description:
        'Manually select project to build. If project is a library, all other libraries will be included.',
      type: 'string[]',
    })
    private readonly runProject: string[],
  ) {
    this.nonInteractive = runAll || nonInteractive || !is.empty(runProject);
  }

  private readonly BUILT_APPS: string[] = [];
  private WORKSPACE = JSON.parse(readFileSync('workspace.json', 'utf8')) as {
    projects: Record<string, string>;
  };

  public async exec(): Promise<void> {
    const affected = await this.listAffected();
    let apps: string[] = [];
    if (!is.empty(affected.apps)) {
      apps = await this.build(affected);
    }
    const version = await this.bumpLibraries();
    apps = apps.filter(name => !this.BUILT_APPS.includes(name));
    if (!is.empty(apps)) {
      await this.bumpApplications(apps, version);
    }
    try {
      if (!is.empty(this.runAfter)) {
        // It's expected that prettyified content is being sent through
        // Without env var, all formatting gets removed
        await this.screen.pipe(
          execa(this.runAfter, affected.apps, {
            env: { FORCE_COLOR: 'true' },
          }),
        );
      }
    } catch (error) {
      this.logger.error(error.shortMessage ?? 'Command failed');
    }
    this.logger.info('DONE!');
  }

  private async build(affected: AffectedList): Promise<string[]> {
    if (!this.nonInteractive) {
      this.screen.down(2);
    }
    this.screen.printLine(chalk.bold.cyan`APPS`);
    affected.apps.forEach(line => {
      const file = join('apps', line, PACKAGE_FILE);
      if (!existsSync(file)) {
        this.screen.printLine(chalk` {yellow - } ${line}`);
        return;
      }
      const { version } = JSON.parse(readFileSync(file, 'utf8')) as PACKAGE;
      this.screen.printLine(
        chalk` {yellow - } ${version ? chalk` {gray ${version}} ` : ''}${line}`,
      );
    });
    if (!this.nonInteractive) {
      this.screen.down();
      this.screen.printLine(chalk`Select applications to rebuild`);
    }
    return this.nonInteractive
      ? affected.apps
      : await this.prompt.listBuild({
          current: affected.apps
            .filter(app => this.hasPublish(app))
            .map(i => [TitleCase(i), i]),
          items: 'Applications',
          source: [],
        });
  }

  private async bumpApplications(
    apps: string[],
    update: string,
  ): Promise<void> {
    apps.forEach(application => {
      const file = join('apps', application, PACKAGE_FILE);
      if (!existsSync(file)) {
        return;
      }
      const packageJSON = JSON.parse(
        readFileSync(file, 'utf8'),
      ) as PackageJsonDTO;
      if (!is.string(packageJSON.version)) {
        return;
      }
      this.logger.info(
        `[${application}] {${packageJSON.version}} => {${update}}`,
      );
      packageJSON.version = update;
      writeFileSync(file, JSON.stringify(packageJSON, undefined, '  ') + `\n`);
    });
    await eachSeries(apps, async app => {
      this.logger.info(`[${app}] publishing`);
      await this.screen.pipe(execa(`npx`, [`nx`, `publish`, app]));
    });
  }

  private async bumpLibraries(): Promise<string | never> {
    const root = await this.bumpRoot();
    const { projects } = this.WORKSPACE;
    const libraries = Object.entries(projects)
      .filter(([, path]) => path?.startsWith('lib'))
      .map(([library]) => library);
    libraries.forEach(library => {
      const file = join('libs', library, PACKAGE_FILE);
      const packageJSON = JSON.parse(
        readFileSync(file, 'utf8'),
      ) as PackageJsonDTO;
      this.logger.info(`[${library}] {${packageJSON.version}} => {${root}}`);
      packageJSON.version = root;
      writeFileSync(file, JSON.stringify(packageJSON, undefined, '  ') + `\n`);
    });
    await eachSeries(libraries, async library => {
      this.logger.info(`[${library}] publishing`);
      try {
        await this.screen.pipe(execa(`npx`, [`nx`, `publish`, library]));
      } catch (error) {
        this.logger.error(error.stderr);
        exit();
      }
    });
    return root;
  }

  private bumpRoot(): string {
    const packageJSON = JSON.parse(
      readFileSync(PACKAGE_FILE, 'utf8'),
    ) as PACKAGE;
    const prefix = dayjs().format('YY.ww');
    packageJSON.version = packageJSON.version.startsWith(prefix)
      ? inc(packageJSON.version, 'patch')
      : `${prefix}.0`;
    writeFileSync(
      PACKAGE_FILE,
      JSON.stringify(packageJSON, undefined, '  ') + `\n`,
    );
    return packageJSON.version;
  }

  private hasPublish(name: string): boolean {
    const target = this.WORKSPACE.projects[name];
    if (target.startsWith('libs')) {
      return true;
    }
    const project = JSON.parse(
      readFileSync(join(target, 'project.json'), 'utf8'),
    ) as { targets: Record<string, unknown> };
    return !is.undefined(project.targets.publish);
  }

  private async listAffected(): Promise<AffectedList> {
    const projects = Object.values(this.WORKSPACE.projects);
    const allApps = projects
      .filter(i => i.startsWith('app'))
      .map(i => i.split('/').pop());
    const allLibs = projects
      .filter(i => i.startsWith('lib'))
      .map(i => i.split('/').pop());
    if (this.runAll) {
      return {
        apps: allApps.filter(i => this.hasPublish(i)),
        libs: allLibs,
      };
    }
    if (!is.empty(this.runProject)) {
      return {
        apps: this.runProject.filter(project => allApps.includes(project)),
        libs: this.runProject.some(project => allLibs.includes(project))
          ? allLibs
          : [],
      };
    }
    const rawApps = await execa(`npx`, ['nx', 'affected:apps', '--plain']);
    const rawLibs = await execa(`npx`, ['nx', 'affected:libs', '--plain']);
    const libs: string[] = rawLibs.stdout
      .split(' ')
      .filter(line => !is.empty(line.trim()));
    const apps: string[] = rawApps.stdout
      .split(' ')
      .filter(line => !is.empty(line.trim()));
    return { apps, libs };
  }
}
