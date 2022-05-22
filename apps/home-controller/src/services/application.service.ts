import { Injectable } from '@nestjs/common';
import { AutoLogService, InjectConfig, OnEvent } from '@steggy/boilerplate';
import { LIB_CONTROLLER_SDK, SAFE_MODE } from '@steggy/controller-sdk';
import {
  HASocketAPIService,
  NotifyDomainService,
} from '@steggy/home-assistant';
import { HA_SOCKET_READY } from '@steggy/home-assistant-shared';

import { NOTIFY_CONNECTION_RESET } from '../config';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectConfig(NOTIFY_CONNECTION_RESET)
    private readonly sendNotification: boolean,
    @InjectConfig(SAFE_MODE, LIB_CONTROLLER_SDK)
    private readonly safeMode: boolean,
    private readonly logger: AutoLogService,
    private readonly notifyService: NotifyDomainService,
    private readonly socketApi: HASocketAPIService,
  ) {}
  private connectionReady = false;

  protected async onPostInit(): Promise<void> {
    this.logger.debug(`Init home assistant socket connection`);
    await this.socketApi.initConnection();
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
      `Connection reset at ${new Date().toLocaleString()}`,
      { title: `Temporarily lost connection with Home Assistant` },
    );
  }
}
