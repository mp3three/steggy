import { iRepl, Repl, WorkspaceService } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { DiscoveryService } from '@nestjs/core';

@Repl({
  name: '💻 Deployments',
})
export class DeployService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  public async exec(): Promise<void> {
    this.discoveryService.getProviders().forEach((wrapper) => {
      wrapper;
    });
    //
  }
}
