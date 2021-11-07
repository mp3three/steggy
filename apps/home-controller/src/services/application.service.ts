import {
  HA_SOCKET_READY,
  NotifyDomainService,
} from '@automagical/home-assistant';
import { AutoLogService, OnEvent } from '@automagical/utilities';
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
