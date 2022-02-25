import { AutoLogService, OnEvent } from '@automagical/boilerplate';
import { NotifyDomainService } from '@automagical/home-assistant';
import { HA_SOCKET_READY } from '@automagical/home-assistant-shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApplicationService {
  constructor(
    protected readonly logger: AutoLogService,
    private readonly notifyService: NotifyDomainService,
  ) {}
  private connectionReady = false;

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
