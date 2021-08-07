import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { RoomExplorerService } from './room-explorer.service';

@Injectable()
export class RelayService {
  // #region Constructors

  constructor(private readonly roomExplorer: RoomExplorerService) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public dimDown(rooms: string[]): void {
    this.roomExplorer.rooms.forEach(async (wrapper) => {
      const settings = this.roomExplorer.getSettings(wrapper);
      if (!rooms.includes(settings.name)) {
        return;
      }
      const controller = this.roomExplorer.getController(wrapper);
      await controller.dimDown();
    });
  }

  @Trace()
  public dimUp(rooms: string[]): void {
    this.roomExplorer.rooms.forEach(async (wrapper) => {
      const settings = this.roomExplorer.getSettings(wrapper);
      if (!rooms.includes(settings.name)) {
        return;
      }
      const controller = this.roomExplorer.getController(wrapper);
      await controller.dimUp();
    });
  }

  @Trace()
  public turnOff(rooms: string[]): void {
    this.roomExplorer.rooms.forEach(async (wrapper) => {
      const settings = this.roomExplorer.getSettings(wrapper);
      if (!rooms.includes(settings.name)) {
        return;
      }
      const controller = this.roomExplorer.getController(wrapper);
      await controller.areaOff();
    });
  }

  @Trace()
  public turnOn(rooms: string[]): void {
    this.roomExplorer.rooms.forEach(async (wrapper) => {
      const settings = this.roomExplorer.getSettings(wrapper);
      if (!rooms.includes(settings.name)) {
        return;
      }
      const controller = this.roomExplorer.getController(wrapper);
      await controller.areaOn();
    });
  }

  // #endregion Public Methods
}
