import {
  ChangeItemDTO,
  ChangelogDTO,
  GitService,
  iRepl,
  OctIcons,
  PromptService,
  Repl,
  REPL_TYPE,
  SystemService,
  TypePromptService,
  WorkspaceService,
} from '@automagical/tty';
import {
  APP_LIVING_DOCS,
  AutoLogService,
  IsEmpty,
  Trace,
} from '@automagical/utilities';
import { eachSeries } from 'async';
import Table from 'cli-table';
import execa from 'execa';
import inquirer from 'inquirer';
import { join } from 'path';
import { inc } from 'semver';

@Repl({
  description: [
    `- Root level change description`,
    `- Project level change description`,
    `- Version bumping`,
  ],
  icon: OctIcons.checklist,
  name: `Changelog`,
  type: REPL_TYPE.maintenance,
})
export class ChangelogService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
    private readonly typePromptService: TypePromptService,
    private readonly gitService: GitService,
    private readonly systemService: SystemService,
    private readonly promptService: PromptService,
  ) {}

  @Trace()
  public async exec(): Promise<void> {
    // Sanity check
    const abort = await this.checkDirty();
    if (abort) {
      return;
    }
    await this.systemService.verifyEditor();
    const affected = await this.listAffected();
    if (IsEmpty(affected)) {
      this.logger.warn(`NX reports 0 affected projects`);
      return;
    }
    // header table
    const table = new Table({
      head: ['Affected Project', 'Current Version'],
    });
    table.push(
      ...affected.map((item) => {
        return [item, this.workspace.PACKAGES.get(item).version];
      }),
    );
    console.log(table.toString(), `\n`);

    // Gather project specific messages
    const messages = (
      await this.gitService.listCommitMessages(
        this.workspace.NX_METADATA.affected.defaultBase,
      )
    ).map((i) => `* ${i}`);
    // Determine the master list of projects that are being affected
    const changes = await this.processAffected(affected);
    // Fill in any messages
    await this.projectMessages(changes, messages);

    const rootVersion = await this.bumpRoot();
    const { user } = await this.gitService.getConfig();

    const { text } = (await inquirer.prompt([
      {
        default: messages.join(`\n\n`),
        message: `Base changelog message`,
        name: 'text',
        type: 'editor',
      },
    ])) as { text: string };
    const changelog: ChangelogDTO = {
      author: user,
      changes,
      date: new Date().toISOString(),
      root: {
        message: {
          text,
        },
        version: rootVersion,
      },
      version: 1,
    };

    // Write changelog info to living docs
    const { root } =
      this.workspace.workspace.projects[APP_LIVING_DOCS.description];

    this.workspace.writeJson(
      join(root, `changelog`, rootVersion, `changelog.json`),
      changelog,
    );

    // Bump living docs version (if not already manually done)
    const docsModified = changes.some(
      (i) => i.project === APP_LIVING_DOCS.description,
    );
    if (!docsModified) {
      const { version } = this.workspace.PACKAGES.get(
        APP_LIVING_DOCS.description,
      );
      const updated = inc(version, 'patch');
      this.workspace.setPackageVersion(APP_LIVING_DOCS.description, updated);
      this.logger.debug(
        {
          from: version,
          to: updated,
        },
        `Bumping docs version`,
      );
    }

    await this.promptService.acknowledge('Done');
  }

  @Trace()
  private async bumpRoot(): Promise<string> {
    const current = this.workspace.ROOT_PACKAGE.version;
    const updated = await this.versionBump(current, `Set root version`);
    this.workspace.ROOT_PACKAGE.version = updated;
    this.workspace.updateRootPackage();
    return updated;
  }

  @Trace()
  private async checkDirty(): Promise<boolean> {
    const isDirty = await this.gitService.isDirty();
    if (!isDirty) {
      return false;
    }
    return await this.typePromptService.confirm(
      `There are uncommitted changes, abort?`,
      true,
    );
  }

  @Trace()
  private async listAffected(): Promise<string[]> {
    const { stdout } = await execa(`nx`, ['print-affected']);
    const { projects } = JSON.parse(stdout) as { projects: string[] };
    return projects;
  }

  /**
   * - Prompt to even add an item
   */
  @Trace()
  private async processAffected(affected: string[]): Promise<ChangeItemDTO[]> {
    const values = await this.promptService.pickMany(
      'Projects to version bump',
      affected,
    );
    if (IsEmpty(values)) {
      const proceed = await this.promptService.confirm(
        `Nothing selected, continue?`,
      );
      if (!proceed) {
        return await this.processAffected(affected);
      }
    }

    const out: ChangeItemDTO[] = [];
    await eachSeries(values as string[], async (project, callback) => {
      const current = this.workspace.PACKAGES.get(project).version;
      const updated = await this.versionBump(
        current,
        `Bump version ${project}`,
      );
      this.workspace.setPackageVersion(project, updated);
      out.push({
        from: current,
        message: {},
        project,
        to: updated,
      });
      callback();
    });
    return out;
  }

  @Trace()
  private async projectMessages(
    affected: ChangeItemDTO[],
    messages: string[],
  ): Promise<void> {
    const { values } = await inquirer.prompt([
      {
        choices: affected.map((i) => i.project),
        message: 'Create project specific messages',
        name: 'values',
        type: 'checkbox',
      },
    ]);
    await eachSeries(values as string[], async (project, callback) => {
      const { text } = (await inquirer.prompt([
        {
          default: messages.join(`\n\n`),
          message: `Changelog message for ${project}`,
          name: 'text',
          type: 'editor',
        },
      ])) as { text: string };

      const item = affected.find((i) => i.project === project);
      item.message.text = text;
      callback();
    });
  }

  @Trace()
  private async versionBump(current: string, message: string): Promise<string> {
    const doInc = (bump) =>
      inc(
        current,
        bump === 'rc' ? 'prerelease' : bump,
        bump === 'rc' ? bump : '',
      );
    const { bump } = await inquirer.prompt([
      {
        choices: ['major', 'minor', 'patch', 'rc'].map((value) => {
          return {
            name: `${value} (${doInc(value)})`,
            value,
          };
        }),
        default: current.includes('-') ? 'rc' : 'patch',
        message: `${message} (${current})`,
        name: 'bump',
        type: 'list',
      },
    ]);
    return doInc(bump);
  }
}
