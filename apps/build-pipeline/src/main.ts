/* eslint-disable radar/no-duplicate-string */
import { Inject } from '@nestjs/common';
import {
  ACTIVE_APPLICATION,
  InjectConfig,
  PACKAGE_FILE,
  PackageJsonDTO,
  QuickScript,
} from '@steggy/boilerplate';
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
import { exit, stdout } from 'process';
import { inc } from 'semver';

type AffectedList = { apps: string[]; libs: string[] };
type PACKAGE = { version: string };

const NX_WORKSPACE = JSON.parse(readFileSync('nx.json', 'utf8')) as {
  affected: { defaultBase: string };
};

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
    @Inject(ACTIVE_APPLICATION) private readonly application: symbol,
    private readonly applicationManager: ApplicationManagerService,
    private readonly logger: SyncLoggerService,
    private readonly promptService: PromptService,
    private readonly screenService: ScreenService,
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
    @InjectConfig('BUMP_ONLY', {
      default: false,
      description: 'Bump versions, do not publish',
      type: 'boolean',
    })
    private readonly bumpOnly: boolean,
    @InjectConfig('CONTAINERIZED', {
      default: false,
      description:
        'Build all code inside standardized containers. Adds complexity, implies NON_INTERACTIVE, but can create repeatable builds across different host systems',
      type: 'boolean',
    })
    private readonly containerizedBuild: boolean,
    @InjectConfig('BASE', {
      default: NX_WORKSPACE?.affected?.defaultBase,
      description:
        'Reference to base commit to measure affected from. Argument passed through to NX, commit SHA is a good value',
      type: 'string',
    })
    private readonly base: string,
    @InjectConfig('HEAD', {
      default: 'HEAD',
      description:
        'Latest commit to measure from. Argument passed through to NX, commit SHA is a good value',
      type: 'string',
    })
    private readonly head: string,
  ) {
    if (containerizedBuild) {
      this.nonInteractive = true;
    }
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
    if (!is.empty(affected.libs)) {
      await this.bumpLibraries(affected);
    }
    apps = apps.filter(name => !this.BUILT_APPS.includes(name));
    if (!is.empty(apps)) {
      await this.bumpApplications(apps);
    }
    try {
      if (!is.empty(this.runAfter)) {
        // It's expected that prettyified content is being sent through
        // Without env var, all formatting gets removed
        const result = execa(this.runAfter, { env: { FORCE_COLOR: 'true' } });
        result.stdout.pipe(stdout);
        await result;
      }
    } catch (error) {
      this.logger.error(error.shortMessage ?? 'Command failed');
    }
    this.logger.info('DONE!');
  }

  private async build(affected: AffectedList): Promise<string[]> {
    if (!this.nonInteractive) {
      this.screenService.down(2);
    }
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
    if (!this.nonInteractive) {
      this.screenService.down();
      this.screenService.print(chalk`Select applications to rebuild`);
    }
    return this.nonInteractive
      ? affected.apps
      : await this.promptService.listBuild({
          current: affected.apps
            .filter(app => this.hasPublish(app))
            .map(i => [TitleCase(i), i]),
          items: 'Applications',
          source: [],
        });
  }

  private async buildInDocker(
    { libs, apps }: AffectedList,
    libraries: string[],
  ): Promise<void> {
    const projects: string[] = [];
    if (!is.empty(libs)) {
      // * Add ALL libraries if any are modified
      projects.push(...libraries);
    }
    apps.forEach(app => {
      // Also add apps that have a publish target, AND a bin listed in the package.json
      // Projects with bin entries need to be published to npm in order to be installed
      const workspace = JSON.parse(
        readFileSync(join('apps', app, 'project.json'), 'utf8'),
      ) as { targets: Record<string, unknown> };
      if (!workspace?.targets?.publish) {
        return;
      }
      const packageFile = join('apps', app, PACKAGE_FILE);
      if (!existsSync(packageFile)) {
        return;
      }
      const packageJson = JSON.parse(
        readFileSync(packageFile, 'utf8'),
      ) as PackageJsonDTO;
      if (!is.empty(Object.entries(packageJson.bin ?? {}))) {
        projects.push(app);
        this.BUILT_APPS.push(app);
      }
    });
    // docker build -f apps/build-pipeline/Dockerfile --build-arg PROJECT_LIST=build-pipeline,boilerplate .
    const publish = execa(`docker`, [
      `build`,
      `-f`,
      `apps/${this.application.description}/Dockerfile`,
      `--build-arg`,
      `PROJECT_LIST=${projects.join(',')}`,
      `.`,
    ]);
    publish.stdout.pipe(stdout);
    await publish;
  }

  private async bumpApplications(apps: string[]): Promise<void> {
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
      const update = inc(packageJSON.version, 'patch');
      this.logger.info(
        `[${application}] {${packageJSON.version}} => {${update}}`,
      );
      packageJSON.version = update;
      writeFileSync(file, JSON.stringify(packageJSON, undefined, '  ') + `\n`);
    });
    if (!this.bumpOnly) {
      await eachSeries(apps, async app => {
        this.logger.info(`[${app}] publishing`);
        const buildDocker = execa(`npx`, [`nx`, `publish`, app]);
        buildDocker.stdout.pipe(stdout);
        await buildDocker;
      });
    }
  }

  private async bumpLibraries(list: AffectedList) {
    const root = await this.bumpRoot(list);
    if (!root) {
      return;
    }
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
    if (!this.bumpOnly) {
      if (this.containerizedBuild) {
        return await this.buildInDocker(list, libraries);
      }
      await eachSeries(libraries, async library => {
        this.logger.info(`[${library}] publishing`);
        try {
          const publish = execa(`npx`, [`nx`, `publish`, library]);
          publish.stdout.pipe(stdout);
          await publish;
        } catch (error) {
          this.logger.error(error.stderr);
          exit();
        }
      });
    }
  }

  private async bumpRoot(affected: AffectedList): Promise<string> {
    const packageJSON = JSON.parse(
      readFileSync('package.json', 'utf8'),
    ) as PACKAGE;
    const newVersion = inc(packageJSON.version, 'patch');
    const proceed =
      this.nonInteractive ||
      (await this.confirmActions(affected, newVersion, packageJSON.version));
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
    const rawApps = await execa(`npx`, [
      'nx',
      'affected:apps',
      '--plain',
      '--base',
      this.base,
      '--head',
      this.head,
    ]);
    const rawLibs = await execa(`npx`, [
      'nx',
      'affected:libs',
      '--plain',
      '--base',
      this.base,
      '--head',
      this.head,
    ]);
    const libs: string[] = rawLibs.stdout
      .split(' ')
      .filter(line => !is.empty(line.trim()));
    const apps: string[] = rawApps.stdout
      .split(' ')
      .filter(line => !is.empty(line.trim()));
    return { apps, libs };
  }
}
