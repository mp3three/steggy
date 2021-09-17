import {
  iRepl,
  Repl,
  TypePromptService,
  WorkspaceService,
} from '@automagical/tty';
import { AutoLogService, Trace } from '@automagical/utilities';
import { eachSeries } from 'async';
import Table from 'cli-table';
import execa from 'execa';
import inquirer from 'inquirer';
import semver, { inc } from 'semver';

@Repl({
  name: 'Changelog',
})
export class ChangelogService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
    private readonly typePromptService: TypePromptService,
  ) {}

  public async exec(): Promise<void> {
    const affected = await this.listAffected();
    const t = new Table({
      head: ['Project'],
    });
    t.push(...affected.map((item) => [item]));
    await eachSeries(affected, async (project, callback) => {
      const add = await this.typePromptService.confirm(
        `Add changelog item for ${project}?`,
        true,
      );
      if (!add) {
        return callback();
      }
      await this.versionBump(project);
      callback();
    });
  }

  @Trace()
  private async listAffected(): Promise<string[]> {
    const { stdout } = await execa(`nx`, ['print-affected']);
    const { projects } = JSON.parse(stdout) as { projects: string[] };
    return projects;
  }

  @Trace()
  private async versionBump(project: string): Promise<void> {
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
    this.workspace.setVersion(project, updated);
  }
}
