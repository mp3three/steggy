import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

import { RoomControllerSettingsDTO } from '..';
import { RoomManagerService } from '../services';

/**
 * Transforms string to `RoomControllerSettingsDTO`
 */
@Injectable()
export class RoomSettingsPipe implements PipeTransform {
  constructor(private readonly roomManager: RoomManagerService) {}
  public transform(value: string): RoomControllerSettingsDTO {
    const settings = this.roomManager.settings.get(value);
    if (!settings) {
      throw new NotFoundException(`Room not found: ${value}`);
    }
    return settings;
  }
}
