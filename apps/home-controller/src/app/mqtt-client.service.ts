import { Inject, Injectable } from '@nestjs/common';
import { MqttService, Payload, Subscribe } from 'nest-mqtt';
import {
  BaseEntity,
  HomeAssistantService,
  MqttResponse,
  RokuInputs,
  RoomDoArgs,
  RoomService,
} from '@automagical/home-assistant';
import { MobileDevice, NotificationGroup } from '../../typings';
import { Logger } from '@automagical/logger';
import { LivingService } from './rooms/living.service';
import { LoftService } from './rooms/loft.service';

@Injectable()
export class MqttClientService {
  // #region Object Properties

  private readonly logger = Logger(MqttClientService);

  private disableTimeout = null;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(MqttService) private readonly mqttService: MqttService,
    @Inject(HomeAssistantService)
    private readonly homeAssistantService: HomeAssistantService,
    private readonly roomService: RoomService,
  ) {
    this.homeAssistantService.on('mqtt', ({ topic, payload }) => {
      this.logger.debug(`>>> ${topic}`);
      this.mqttService.publish(topic, payload);
    });
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    this.logger.notice(
      `':::::::::::SENDING PAUSE / ${process.env.NODE_ENV}:::::::::::'`,
    );
    setInterval(() => this.sendOnline(), 1000 * 60);
    process.nextTick(() => this.sendOnline());
    [
      'SIGINT',
      'SIGQUIT',
      'SIGTERM',
      'uncaughtException',
      'exit',
      'SIGHUP',
    ].forEach((i) => process.on(i, () => this.beforeExit()));
  }

  // #endregion Constructors

  // #region Private Methods

  @Subscribe('/watch/command/carAc/')
  private async carAc() {
    return;
  }

  @Subscribe({
    topic: '/core/pause/',
  })
  private async pauseService() {
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    if (this.disableTimeout) {
      clearTimeout(this.disableTimeout);
    }
    this.disableTimeout = setTimeout(() => {
      this.disableTimeout = null;
      if (BaseEntity.DISABLE_INTERACTIONS === false) {
        return;
      }
      // Maybe it got stuck in the debugger and I went for dinner?
      // Or was not a ctrl-c type killing (might add more types later)
      this.logger.notice(`BaseEntity.DISABLE_INTERACTIONS = false`);
      BaseEntity.DISABLE_INTERACTIONS = false;
      this.homeAssistantService.sendNotification(
        MobileDevice.generic,
        'BaseEntity.DISABLE_INTERACTIONS = false',
        NotificationGroup.serverStatus,
      );
    }, 1000 * 60 * 2);
    if (BaseEntity.DISABLE_INTERACTIONS) {
      return;
    }
    this.logger.notice(`BaseEntity.DISABLE_INTERACTIONS = true`);
    BaseEntity.DISABLE_INTERACTIONS = true;
  }

  @Subscribe({
    topic: '/core/unpause/',
  })
  private async unpauseService() {
    if (process.env.NODE_ENV === 'development') {
      process.exit();
    }
    this.logger.notice(`BaseEntity.DISABLE_INTERACTIONS = false`);
    BaseEntity.DISABLE_INTERACTIONS = false;
  }

  @Subscribe({
    topic: '/esp8266/online',
    transform: (payload) => payload.toString(),
  })
  private async espOnline(@Payload() macAddress: string) {
    const response: MqttResponse = await this.homeAssistantService.configureEsp(
      macAddress,
    );
    this.logger.debug(response);
    this.mqttService.publish(response.topic, response.payload);
    setTimeout(() => {
      this.mqttService.publish(`${response.payload}/forward`, '50');
    }, 1000);
    setTimeout(() => {
      this.mqttService.publish(`${response.payload}/backward`, '50');
    }, 2000);
  }

  @Subscribe({
    topic: '/room/exec/',
  })
  private async setSceneRoom(@Payload() data: RoomDoArgs) {
    return this.roomService.exec(data);
  }

  @Subscribe({
    topic: '/tv/living/',
  })
  private async setLivingTv(@Payload() input: RokuInputs) {
    const room = RoomService.ROOM_LIST.living as LivingService;
    room.setRoku(input);
  }

  @Subscribe({
    topic: '/tv/loft/',
  })
  private async setLoftTv(@Payload() input: RokuInputs) {
    const room = RoomService.ROOM_LIST.loft as LoftService;
    room.setRoku(input);
  }

  @Subscribe({
    topic: '/watch/command/leave/',
  })
  private async lockUp() {
    this.roomService.globalExec({
      setDir: false,
      everything: true,
    });
    this.homeAssistantService.setLocks(false);
  }

  @Subscribe({
    topic: '/watch/command/setLocks/',
  })
  private async setHouseLocks(@Payload('text') state: 'lock' | 'unlock') {
    this.homeAssistantService.setLocks(state !== 'unlock');
  }

  private async beforeExit() {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    this.logger.notice(`Sending /core/unpause/`);
    await this.mqttService.publish(`/core/unpause/`, process.env.NODE_ENV);
    process.exit();
  }

  private sendOnline() {
    return this.mqttService.publish(`/core/pause/`, process.env.NODE_ENV);
  }

  // #endregion Private Methods
}
