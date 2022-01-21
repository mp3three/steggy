import { Injectable } from '@nestjs/common';
import { AutoLogService, OnEvent } from '@text-based/boilerplate';
import {
  HA_SOCKET_READY,
  NotifyDomainService,
} from '@text-based/home-assistant';

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
