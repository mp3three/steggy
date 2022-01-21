import { Injectable } from '@nestjs/common';
import { AutoLogService, OnEvent } from '@text-based/boilerplate';
import { NotifyDomainService } from '@text-based/home-assistant';
import { HA_SOCKET_READY } from '@text-based/home-assistant-shared';

@Injectable()
export class ApplicationService {
  constructor(
    protected readonly logger: AutoLogService,
    private readonly notifyService: NotifyDomainService,
  ) {}
  private connectionReady = false;

  protected onModuleInit(): void {
    //
  }

  @OnEvent(HA_SOCKET_READY)
  protected async onSocketReset(): Promise<void> {
    if (!this.connectionReady) {
      this.connectionReady = true;
      return;
    }
    await this.notifyService.notify(
      `Connection reset at ${new Date().toISOString()}`,
      {
        title: `Temporarily lost connection with Home Assistant`,
      },
    );
  }
}
