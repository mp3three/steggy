import { Injectable } from '@nestjs/common';
import {
  AutoLogService,
  InjectConfig,
  OnEvent,
} from '@steggy/boilerplate';
import { NotifyDomainService } from '@steggy/home-assistant';
import { HA_SOCKET_READY } from '@steggy/home-assistant-shared';

import { NOTIFY_CONNECTION_RESET, SAFE_MODE } from '../config';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectConfig(NOTIFY_CONNECTION_RESET)
    private readonly sendNotification: boolean,
    @InjectConfig(SAFE_MODE)
    private readonly safeMode: boolean,
    private readonly logger: AutoLogService,
    private readonly notifyService: NotifyDomainService,
  ) {}
  private connectionReady = false;

  protected onPostInit(): void {
    // Mostly here for easy confirmation that the time zone is correct in containers
    this.logger.info(`Server boot time {${new Date().toLocaleString()}}`);
    if (this.safeMode) {
      this.logger.warn(`[SAFE_MODE] set, no connection reset notifications`);
    }
  }

  @OnEvent(HA_SOCKET_READY)
  protected async onSocketReset(): Promise<void> {
    if (!this.connectionReady) {
      this.connectionReady = true;
      return;
    }
    if (!this.sendNotification || this.safeMode) {
      return;
    }
    // This should NOT be happening regularly
    await this.notifyService.notify(
      `Connection reset at ${new Date().toISOString()}`,
      { title: `Temporarily lost connection with Home Assistant` },
    );
  }
}
