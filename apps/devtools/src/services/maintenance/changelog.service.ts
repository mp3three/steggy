import {
  ChangeItemDTO,
  ICONS,
  iRepl,
  PromptService,
  Repl,
} from '@ccontour/tty';
import {
  AutoLogService,
  IsEmpty,
  TitleCase,
  WorkspaceService,
} from '@ccontour/utilities';
import { eachSeries } from 'async';
import Table from 'cli-table';
import execa from 'execa';
import { inc } from 'semver';

@Repl({
  category: `Maintenance`,
  description: [
    `- Root level change description`,
    `- Project level change description`,
    `- Version bumping`,
  ],
  icon: ICONS.CAPTURE,
  name: `Changelog`,
})
export class ChangelogService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(): Promise<void> {
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
    await this.processAffected(affected);
    await this.bumpRoot();
    await this.promptService.acknowledge('Done');
  }

  private async bumpRoot(): Promise<string> {
    const current = this.workspace.ROOT_PACKAGE.version;
    const updated = await this.versionBump(current, `Set root version`);
    this.workspace.ROOT_PACKAGE.version = updated;
    this.workspace.updateRootPackage();
    return updated;
  }

  private async listAffected(): Promise<string[]> {
    const { stdout } = await execa(`nx`, ['print-affected']);
    const { projects } = JSON.parse(stdout) as { projects: string[] };
    return projects;
  }

  /**
   * - Prompt to even add an item
   */

  private async processAffected(affected: string[]): Promise<ChangeItemDTO[]> {
    const values = await this.promptService.pickMany(
      'Projects to version bump',
      affected.map((i) => [TitleCase(i), i]),
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
    await eachSeries(values as string[], async (project) => {
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
    });
    return out;
  }

  private async versionBump(current: string, message: string): Promise<string> {
    const doInc = (bump) =>
      inc(
        current,
        bump === 'rc' ? 'prerelease' : bump,
        bump === 'rc' ? bump : '',
      );
    return doInc(
      await this.promptService.pickOne(
        message,
        ['major', 'minor', 'patch', 'rc'].map((value) => [
          `${value} (${doInc(value)})`,
          value,
        ]),
        current.includes('-') ? 'rc' : 'patch',
      ),
    );
  }
}
