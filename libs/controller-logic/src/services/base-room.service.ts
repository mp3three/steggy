import { RouteInjector } from '@automagical/server';
import { Body, INestApplication } from '@nestjs/common';

import {
  ROOM_CONTROLLER_SETTINGS,
  RoomCommandDTO,
  RoomControllerSettingsDTO,
} from '..';

export class BaseRoomService {
  protected settings: RoomControllerSettingsDTO;

  protected async onPreInit(app: INestApplication): Promise<void> {
    this.settings = this.constructor[ROOM_CONTROLLER_SETTINGS];
    const methods = [];
    this.settings.accessories ??= [];
    this.settings.lights ??= [];
    if (this.settings.lights.length === 0) {
      if (this.settings.switches.length > 0) {
        methods.push('areaOn', 'areaOff');
      }
    } else {
      methods.push('areaOn', 'areaOff', 'favorite', 'dimUp', 'dimDown');
    }
    if (this.settings.fan) {
      methods.push('fanUp', 'fanDown');
    }
    this.injectHttp(app, methods);
  }

  public async areaOn(@Body() command?: RoomCommandDTO): Promise<void> {
    //
  }
  public async areaOff(@Body() command?: RoomCommandDTO): Promise<void> {
    //
  }
  public async dimUp(@Body() command?: RoomCommandDTO): Promise<void> {
    //
  }
  public async dimDown(@Body() command?: RoomCommandDTO): Promise<void> {
    //
  }
  public async favorite(@Body() command?: RoomCommandDTO): Promise<void> {
    //
  }
  public async fanUp(@Body() command?: RoomCommandDTO): Promise<void> {
    //
  }
  public async fanDown(@Body() command?: RoomCommandDTO): Promise<void> {
    //
  }

  private injectHttp(app: INestApplication, methods: string[]): void {
    const routeInjector = app.get(RouteInjector);
    methods.forEach((method) => {
      routeInjector.inject({
        instance: this,
        method: 'put',
        name: `${method}`,
        path: `/${method}`,
      });
    });
  }
}
