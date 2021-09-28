import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

import { iRoomController } from '..';
import { RoomManagerService } from '../services';

@Injectable()
export class RoomInstancePipe implements PipeTransform {
  constructor(private readonly roomManager: RoomManagerService) {}
  public transform(value: string): iRoomController {
    const controller = this.roomManager.controllers.get(value);
    if (!controller) {
      throw new NotFoundException(`Room not found: ${value}`);
    }
    return controller;
  }
}
