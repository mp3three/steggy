import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

import { RoomControllerSettingsDTO } from '..';
import { RoomManagerService } from '../services';

@Injectable()
export class RoomSettingsPipe implements PipeTransform {
  constructor(private readonly roomManager: RoomManagerService) {}
  public async transform(value: string): Promise<RoomControllerSettingsDTO> {
    const settings = this.roomManager.settings.get(value);
    if (!settings) {
      throw new NotFoundException(`Room not found: ${value}`);
    }
    return settings;
  }
}
