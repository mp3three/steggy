import {
  EntityManagerService,
  HassStateDTO,
} from '@automagical/home-assistant';
import { AutoLogService, Trace } from '@automagical/utilities';
import { BadRequestException, Injectable } from '@nestjs/common';

import { DescribeGroupResponseDTO } from '../contracts';
import { RoomManagerService } from './room-manager.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly roomManager: RoomManagerService,
  ) {}

  @Trace()
  public allGroups(): Map<[string, string], HassStateDTO[]> {
    const out = new Map<[string, string], HassStateDTO[]>();
    this.roomManager.settings.forEach((settings) => {
      const groups = Object.keys(settings.groups ?? {});
      if (groups.length === 0) {
        return;
      }
      groups.forEach((group) => {
        out.set(
          [settings.name, group],
          this.entityManager.getEntity(settings.groups[group]),
        );
      });
    });
    return out;
  }

  @Trace()
  public describeGroup(room: string, group: string): DescribeGroupResponseDTO {
    const settings = this.roomManager.settings.get(room);
    if (!settings?.groups) {
      throw new BadRequestException(`Room does not contain groups`);
    }
    return {
      states: this.entityManager.getEntity(settings.groups[group] ?? []),
    };
  }
}
