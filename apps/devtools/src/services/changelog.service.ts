import {
  GitService,
  iRepl,
  Repl,
  SystemService,
  TypePromptService,
  WorkspaceService,
} from '@automagical/tty';
import { AutoLogService, sleep, Trace } from '@automagical/utilities';
import { eachSeries } from 'async';
import Table from 'cli-table';
import execa from 'execa';
import inquirer from 'inquirer';
import { inc } from 'semver';

@Repl({
  name: 'Changelog',
})
export class ChangelogService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
    private readonly typePromptService: TypePromptService,
    private readonly gitService: GitService,
    private readonly systemService: SystemService,
  ) {}

  /**
   * - Verify there are no uncommitted changes
   * - Make sure the user is fine with their editor selection
   * - Find all libs / apps that have been affected by changes
   * - Print table with name / version
   * - Run through each, prompting for a specific changelog message, and bumping the version
   *   - Default changelog message will be a listing of all the recent commit messages
   * - Bump the base package version
   * - Write metadata to living docs
   */
  @Trace()
  public async exec(): Promise<void> {
    const abort = await this.checkDirty();
    if (abort) {
      return;
    }
    await this.systemService.verifyEditor();
    const affected = await this.listAffected();
    if (affected.length === 0) {
      this.logger.warn(`NX reports 0 affected projects`);
      return;
    }
    const table = new Table({
      head: ['Affected Project', 'Current Version'],
    });
    table.push(
      ...affected.map((item) => {
        return [item, this.workspace.PACKAGES.get(item).version];
      }),
    );
    console.log(table.toString(), `\n`);

    const messages = (
      await this.gitService.listCommitMessages(
        this.workspace.NX_METADATA.affected.defaultBase,
      )
    ).map((i) => `* ${i}`);

    await eachSeries(affected, async (project, callback) => {
      await this.processAffected(project, messages);
      callback();
    });

    await sleep(5000);
  }

  @Trace()
  private async processAffected(
    project: string,
    commitMessages: string[],
  ): Promise<void> {
    const add = await this.typePromptService.confirm(
      `Add changelog item for ${project}?`,
      true,
    );
    if (!add) {
      return;
    }
    const { changelogMessage } = await inquirer.prompt([
      {
        default: commitMessages.join(`\n\n`),
        message: `Changelog message`,
        name: 'changelogMessage',
        type: 'editor',
      },
    ]);
    const versions = await this.versionBump(project);
    console.log(changelogMessage, versions);
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

  @Trace()
  private async versionBump(project: string): Promise<[string, string]> {
    const current = this.workspace.PACKAGES.get(project).version;
    const { bump } = await inquirer.prompt([
      {
        choices: ['major', 'minor', 'patch', 'rc'],
        default: current.includes('-') ? 'rc' : 'patch',
        message: 'Bump version',
        name: 'bump',
        type: 'list',
      },
    ]);
    const updated = inc(
      current,
      bump === 'rc' ? 'prerelease' : bump,
      bump === 'rc' ? bump : '',
    );
    this.workspace.setPackageVersion(project, updated);
    return [current, updated];
  }
}
