import { iRepl, Repl, WorkspaceService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';

@Repl({
  name: 'Deployments',
})
export class DeployService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
  ) {}

  public async exec(): Promise<void> {
    //
  }
}
