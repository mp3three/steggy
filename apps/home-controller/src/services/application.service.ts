// import {
//   APP_HOME_CONTROLLER,
//   CONNECTION_RESET,
// } from '@automagical/contracts/constants';
// import {
//   domain,
//   HASS_DOMAINS,
//   HassEventDTO,
//   HomeAssistantRoomConfigDTO,
//   split,
// } from '@automagical/contracts/home-assistant';
// import { EntityService, HASocketAPIService } from '@automagical/home-assistant';
// import { InjectLogger, sleep } from '@automagical/utilities';
// import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { OnEvent } from '@nestjs/event-emitter';
// import { Cron } from '@nestjs/schedule';
// import { Cache } from 'cache-manager';
// import dayjs from 'dayjs';
// import { PinoLogger } from 'nestjs-pino';

// enum LoftRokuInputs {
//   off = 'off',
//   windows = 'hdmi2',
//   personal = 'hdmi3',
//   work = 'hdmi1',
// }
// type MilageHistory = {
//   attributes: {
//     friendly_name: string;
//     icon: string;
//     unit_of_mesurement: string;
//   };
//   entity_id: string;
//   last_changed: string;
//   last_updated: string;
//   state: string;
// };
// @Injectable()
// export class ApplicationService {
//   // #region Object Properties

//   // private logger = Logger(AppService);
//   private sendDoorNotificationTimeout = {};

//   // #endregion Object Properties

//   // #region Constructors

//   constructor(
//     private readonly homeAssistantService: HomeAssistantService,
//     private readonly entityService: EntityService,
//     private readonly socketService: HASocketAPIService,
//     @InjectLogger(ApplicationService, APP_HOME_CONTROLLER)
//     protected readonly logger: PinoLogger,
//     private readonly configService: ConfigService,
//     @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
//   ) {}

//   // #endregion Constructors

//   // #region Private Methods

//   @Cron('0 0 11 * * Wed,Sat')
//   private async batteryMonitor() {
//     this.logger.debug('batteryMonitor');
//     await this.socketService.getAllEntitities();
//     await sleep(1000);
//     const entities = this.entityService.entityList().filter((entityId) => {
//       const [domain, suffix] = split(entityId);
//       return domain !== HASS_DOMAINS.sensor || !suffix.includes('battery');
//     });

//     entities.forEach(async (item) => {
//       const entity = await this.entityService.byId(item);
//       const pct = Number(entity.state);
//       if (pct < 10) {
//         this.homeAssistantService.sendNotification(
//           MobileDevice.generic,
//           `${entity.attributes.friendly_name} is at ${entity.state}%`,
//           NotificationGroup.environment,
//         );
//       }
//     });
//   }

//   @Cron('0 0 11 * * *')
//   private dayInfo() {
//     this.logger.debug(`dayInfo`);
//     const cal = this.entityService.SOLAR_CALC;
//     const start = dayjs(cal.goldenHourStart).format('hh:mm');
//     const end = dayjs(cal.goldenHourEnd).format('hh:mm');
//     const message = `🌄 ${dayjs().format('ddd MMM DD')}: ${start} - ${end}`;
//     this.homeAssistantService.sendNotification(
//       MobileDevice.generic,
//       message,
//       NotificationGroup.environment,
//     );
//   }

//   // @OnEvent(['*', 'double'])
//   // private async autoLock() {
//   //   this.logger.info(`autoLock`);
//   //   return this.setLocks(HassServices.lock);
//   // }
//   @OnEvent([CONNECTION_RESET])
//   private async onSocketReset() {
//     this.logger.debug('onSocketReset');
//     await sleep(10000);
//     await this.socketService.call(
//       MobileDevice.generic,
//       {
//         data: {
//           push: {
//             'thread-id': NotificationGroup.serverStatus,
//           },
//         },
//         message: `Connection reset at ${new Date().toISOString()}`,
//         title: `core temporarily lost connection with HomeAssistant`,
//       },
//       HASS_DOMAINS.notify,
//     );
//   }

//   @OnEvent('switch.bedroom_switch/2')
//   private async screenToPersonal() {
//     this.logger.debug('screenToPersonal');
//     await this.roomService.setRoku(
//       LoftRokuInputs.personal,
//       this.configService.get(LOFT_MONITOR),
//     );
//   }

//   @OnEvent('switch.bedroom_switch/1')
//   private async screenToWindows() {
//     this.logger.debug('screenToWindows');
//     await this.roomService.setRoku(
//       LoftRokuInputs.windows,
//       this.configService.get(LOFT_MONITOR),
//     );
//   }

//   @OnEvent('switch.bedroom_switch/3')
//   private async screenToWork() {
//     this.logger.debug('screenToWork');
//     await this.roomService.setRoku(
//       LoftRokuInputs.work,
//       this.configService.get(LOFT_MONITOR),
//     );
//   }

//   /**
//    * Watch binary sensors w/ "door" in the name for changes.
//    * Notify on change.
//    */
//   @OnEvent(`*/update`)
//   private sendDoorNotification(event: HassEventDTO) {
//     const [domain, suffix] = split(event.data.entity_id);
//     if (
//       (domain as HASS_DOMAINS) !== HASS_DOMAINS.binary_sensor ||
//       !suffix.includes('door')
//     ) {
//       return;
//     }
//     if (this.sendDoorNotificationTimeout) {
//       clearTimeout(this.sendDoorNotificationTimeout[event.data.entity_id]);
//     }
//     this.sendDoorNotificationTimeout[event.data.entity_id] = setTimeout(() => {
//       this.homeAssistantService.sendNotification(
//         MobileDevice.generic,
//         `${event.data.entity_id} is now ${
//           event.data.new_state.state === 'on' ? 'closed' : 'open'
//         }`,
//         NotificationGroup.door,
//       );
//       this.sendDoorNotificationTimeout[event.data.entity_id] = undefined;
//     }, 250);
//   }

//   @OnEvent('loft/off')
//   @OnEvent('switch.bedroom_switch/4')
//   private async screenOff() {
//     this.logger.debug('screenOff');
//     await this.roomService.setRoku(
//       LoftRokuInputs.off,
//       this.configService.get(LOFT_MONITOR),
//     );
//   }

//   // #endregion Private Methods
// }
