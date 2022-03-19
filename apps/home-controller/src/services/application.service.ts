import {
  AutoLogService,
  InjectConfig,
  OnEvent,
} from '@automagical/boilerplate';
import { NotifyDomainService } from '@automagical/home-assistant';
import { HA_SOCKET_READY } from '@automagical/home-assistant-shared';
import { Injectable } from '@nestjs/common';

import { NOTIFY_CONNECTION_RESET } from '../config';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectConfig(NOTIFY_CONNECTION_RESET)
    private readonly sendNotification: boolean,
    private readonly logger: AutoLogService,
    private readonly notifyService: NotifyDomainService,
  ) {}
  private connectionReady = false;

  protected onApplicationBootstrap(): void {
    this.logger.info(`Server time is {${new Date().toLocaleString()}}`);
  }

  @OnEvent(HA_SOCKET_READY)
  protected async onSocketReset(): Promise<void> {
    if (!this.connectionReady) {
      this.connectionReady = true;
      return;
    }
    if (!this.sendNotification) {
      return;
    }
    await this.notifyService.notify(
      `Connection reset at ${new Date().toISOString()}`,
      { title: `Temporarily lost connection with Home Assistant` },
    );
  }
}
