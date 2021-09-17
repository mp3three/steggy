import {
  iRepl,
  Repl,
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
  ) {}

  public async exec(): Promise<void> {
    const affected = await this.listAffected();
    if (affected.length === 0) {
      await sleep(5000);
      this.logger.warn(`NX reports 0 affected projects`);
      return;
    }
    const t = new Table({
      head: ['Affected Project', 'Current Version'],
    });
    t.push(
      ...affected.map((item) => {
        return [item, this.workspace.PACKAGES.get(item).version];
      }),
    );
    console.log(t.toString(), `\n`);
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

    //
    await sleep(5000);
  }

  @Trace()
  private async listAffected(): Promise<string[]> {
    const { stdout } = await execa(`nx`, ['print-affected']);
    const { projects } = JSON.parse(stdout) as { projects: string[] };
    return projects;
  }

  @Trace()
  private async versionBump(project: string): Promise<string> {
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
    return this.workspace.setVersion(project, updated);
  }
}
