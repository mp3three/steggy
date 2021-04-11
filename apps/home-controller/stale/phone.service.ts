// import {
//   EntityService,
//   HomeAssistantService,
//   SocketService,
// } from '@automagical/home-assistant';
// import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
// import { Injectable } from '@nestjs/common';

// type MilageHistory = {
//   last7: string; // MYSTIQUE_MILAGE_LAST7
//   current: string; // MYSTIQUE_MILAGE
//   today: string; // MYSTIQUE_MILAGE_TODAY
// };

// export class PhoneResponseDTO {}

// @Injectable()
// export class PhoneService {
//   // #region Static Properties

//   private static IS_WORKING_BACKGROUND = false;
//   private static WAITING_BACKGROUND_COUNT = 0;

//   // #endregion Static Properties

//   // #region Private Static Methods

//   private static addBackgroundTask(fn) {
//     this.WAITING_BACKGROUND_COUNT++;
//     this.IS_WORKING_BACKGROUND = true;
//     process.nextTick(async () => {
//       await fn();
//       this.WAITING_BACKGROUND_COUNT--;
//       this.IS_WORKING_BACKGROUND = this.WAITING_BACKGROUND_COUNT > 0;
//     });
//   }

//   // #endregion Private Static Methods

//   // #region Object Properties

//   protected readonly logger = Logger(PhoneService);

//   private milageHistory: MilageHistory;

//   // #endregion Object Properties

//   // #region Constructors

//   public constructor(
//     private readonly socketService: SocketService,
//     private readonly homeAssistantService: HomeAssistantService,
//     private readonly entityService: EntityService,
//   ) {
//     setTimeout(() => this.updateMilageStats(), 1000);
//   }

//   // #endregion Constructors

//   // #region Public Methods

//   public async controlRoku(
//     location: 'loft' | 'living_room',
//     payload: string,
//   ): Promise<null> {
//     this.logger.debug(`controlRoku`, location, payload);
//     return null;
//     // const topic =
//     //   MqttTopics[
//     //     location === 'loft' ? 'loftMonitorCommand' : 'livingRoomTvCommand'
//     //   ];
//     // return this.socketService.sendMqtt(topic, {
//     //   payload,
//     // });
//   }

//   public async getPhoneState(): Promise<PhoneResponseDTO> {
//     const [
//       viparLights,
//       quantumBoards,
//       transferPump,
//       frunkLock,
//       chargeRateSensor,
//       // milageSensor,
//       rangeSensor,
//       batterySensor,
//       carClimate,
//       loftFan,
//       gamesFan,
//       bedroomFan,
//       livingFan,
//       carInside,
//       carOutside,
//       backDoor,
//       frontDoor,
//       backYardLight,
//       // couchLight,
//       updateAvailable,
//       // sensor
//     ] = await Promise.all(
//       [
//         'switch.vipar_lights', // LIGHT_VIPAR
//         'switch.quantum_boards', // LIGHT_QB
//         'switch.transfer_pump', // XFER_PUMP
//         'lock.mystique_frunk_lock', // MYSTIQUE_FRUNK
//         'sensor.mystique_charging_rate_sensor', // MYSTIQUE_MILAGE
//         // 'sensor.mystique_mileage_sensor', // MYSTIQUE_MILAGE
//         'sensor.mystique_range_sensor', // MYSTIQUE_RANGE
//         'sensor.mystique_battery_sensor', // MYSTIQUE_BATTERY_LEVEL + MYSTIQUE_CHARGING
//         'climate.mystique_hvac_climate_system', // MYSTIQUE_CLIMATE_ACTIVE
//         'fan.loft_ceiling_fan', // FAN_LOFT
//         'fan.games_ceiling_fan', // FAN_GAMES
//         'fan.master_bedroom_ceiling_fan', // FAN_BEDROOM
//         'fan.living_room_ceiling_fan', // FAN_LIVING
//         'sensor.mystique_temperature_sensor_inside', // MYSTIQUE_TEMP_INSIDE
//         'sensor.mystique_temperature_sensor_outside', // MYSTIQUE_TEMP_OUTSIDE
//         'lock.back_door', // LOCK_BACK
//         'lock.front_door', // LOCK_FRONT
//         'switch.back_yard_light', // LIGHT_BACK
//         // 'switch.couch_light', // LIGHT_BACK
//         'binary_sensor.mystique_update_available_sensor', // MYSTIQUE_UPDATE_AVAILABLE
//         // 'binary_sensor.front_door_open'
//       ].map(async (i) => await this.entityService.byId(i)),
//     );
//     return {
//       tesla: {
//         battery_level: batterySensor.state,
//         battery_charging: chargeRateSensor.attributes.time_left ? true : false,
//         climate_active: carClimate.state,
//         climate_target: carClimate.attributes.temperature,
//         inside: carInside.state,
//         outside: carOutside.state,
//         range: Math.floor(Number(rangeSensor.state)),
//         milage: this.milageHistory,
//         update_available: updateAvailable.state,
//         charge_timeleft: this.formatChargeTime(
//           chargeRateSensor.attributes.time_left as number,
//         ),
//         frunk: frunkLock.state,
//       },
//       garage: {
//         viparLights: viparLights.state,
//         quantumBoards: quantumBoards.state,
//         transferPump: transferPump.state,
//       },
//       fans: {
//         games: gamesFan.attributes.speed,
//         living: livingFan.attributes.speed,
//         loft: loftFan.attributes.speed,
//         bedroom: bedroomFan.attributes.speed,
//       },
//       locks: {
//         front: frontDoor.state,
//         back: backDoor.state,
//       },
//       lights: {
//         back: backYardLight.state,
//         // couch: couchLight.state,
//       },
//       warnings: await this.getWarnings(), // API_WARNINGS
//       backgroundWork: PhoneService.IS_WORKING_BACKGROUND,
//     };
//   }

//   public async leaveHome(): Promise<PhoneResponseDTO> {
//     // await this.socketService.sendMqtt(MqttTopics.leaveHome, {
//     //   payload: 'leave_home',
//     // });
//     return this.getPhoneState();
//   }

//   public async lockHouse(): Promise<PhoneResponseDTO> {
//     await this.setLocks(HassServices.lock);
//     return this.getPhoneState();
//   }

//   public async openFrunk(): Promise<PhoneResponseDTO> {
//     const entity_id = 'lock.mystique_frunk_lock';
//     PhoneService.addBackgroundTask(() =>
//       this.socketService.call(HassDomains.lock, HassServices.unlock, {
//         entity_id,
//       }),
//     );
//     return this.getPhoneState();
//   }

//   public async setFan(command: FanCommandDto): Promise<PhoneResponseDTO> {
//     const id = `fan.${command.room}_ceiling_fan`;
//     const entity = await this.entityService.byId(id);
//     if (!entity) {
//       throw new Error(`Cannot find entity: ${id}`);
//     }
//     if (entity.attributes.speed !== command.speed) {
//       const onChange = entity.onNextChange();
//       await this.socketService.call(HassDomains.fan, HassServices.set_speed, {
//         entity_id: id,
//         speed: command.speed,
//       });
//       await onChange;
//     }
//     return this.getPhoneState();
//   }

//   public async toggleClimate(): Promise<PhoneResponseDTO> {
//     const entity_id = 'climate.mystique_hvac_climate_system';
//     const entity = await this.entityService.byId(entity_id);
//     PhoneService.addBackgroundTask(() =>
//       this.socketService.call(
//         HassDomains.climate,
//         HassServices[entity.state === 'off' ? 'turn_on' : 'turn_off'],
//         {
//           entity_id,
//         },
//       ),
//     );
//     return this.getPhoneState();
//   }

//   public async toggleSwitch(switchName: string): Promise<PhoneResponseDTO> {
//     const entity = await this.entityService.byId(switchName);
//     const onChange = entity.onNextChange();
//     await this.socketService.call(HassDomains.switch, HassServices.toggle, {
//       entity_id: switchName,
//     });
//     await onChange;
//     return this.getPhoneState();
//   }

//   public async unlockHouse(): Promise<PhoneResponseDTO> {
//     await this.setLocks(HassServices.unlock);
//     return this.getPhoneState();
//   }

//   // #endregion Public Methods

//   // #region Private Methods

//   private formatChargeTime(chargeTime: number) {
//     const minutes = Math.floor(chargeTime * 60);
//     const hours = Math.floor(minutes / 60);
//     let out = '';
//     if (hours > 0) {
//       out = `${hours}h `;
//     }
//     out = `${out}${minutes % 60}m`;
//     return out;
//   }

//   private async getWarnings() {
//     const warnings = [];
//     ['lock.back_door', 'lock.front_door']
//       .map((i) => this.entityService.byId(i))
//       .forEach(async (e: Promise<iEntity>) => {
//         const entity = await e;
//         const warnings = await entity.getWarnings();
//         warnings.forEach((w) => {
//           warnings.push(w);
//         });
//       });
//     return warnings;
//   }

//   private setLocks(service: HassServices) {
//     return Promise.all(
//       ['lock.back_door', 'lock.front_door'].map((entity_id) =>
//         this.socketService.call(HassDomains.lock, service, {
//           entity_id,
//         }),
//       ),
//     );
//   }

//   private async updateMilageStats() {
//     const entityId = 'sensor.mystique_mileage_sensor';
//     const history = await this.homeAssistantService.getMystiqueMilageHistory(
//       entityId,
//     );
//     if (!history || history.length === 0) {
//       return;
//     }
//     this.milageHistory = {
//       last7: (
//         Number(history[history.length - 1].miles) - Number(history[0].miles)
//       ).toLocaleString(),
//       today: (
//         Number(history[history.length - 1].miles) -
//         Number(history[history.length - 2].miles)
//       ).toLocaleString(),
//       current: Number(history[history.length - 1].miles).toLocaleString(),
//     };
//     setTimeout(() => this.updateMilageStats(), 1000 * 60 * 60);
//   }

//   // #endregion Private Methods
// }
