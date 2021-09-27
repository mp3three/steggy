import {
  RoomControllerFlags,
  RoomControllerSettingsDTO,
} from '@automagical/controller-logic';
import { FetchService, FetchWith, InjectConfig } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { ADMIN_KEY, CONTROLLER_API } from '../../config';

type MenuItem = { name: string; value: RoomControllerSettingsDTO };

@Injectable()
export class HomeFetchService {
  constructor(
    private readonly fetchService: FetchService,
    @InjectConfig(ADMIN_KEY) private readonly adminKey: string,
    @InjectConfig(CONTROLLER_API) readonly url: string,
  ) {
    fetchService.BASE_URL = url;
  }

  public fetch<T>(fetch: FetchWith): Promise<T> {
    fetch.adminKey = this.adminKey;
    return this.fetchService.fetch<T>(fetch);
  }

  public async listRooms(): Promise<
    Record<'primary' | 'secondary', MenuItem[]>
  > {
    const rooms = await this.fetch<RoomControllerSettingsDTO[]>({
      url: `/room/list`,
    });
    if (rooms.length === 0) {
      return undefined;
    }
    const primary: MenuItem[] = [];
    const secondary: MenuItem[] = [];
    rooms.forEach((room) => {
      const entry: MenuItem = {
        name: room.friendlyName,
        value: room,
      } as MenuItem;
      if (room.flags.includes(RoomControllerFlags.SECONDARY)) {
        secondary.push(entry);
        return;
      }
      primary.push(entry);
    });
    return { primary: this.sort(primary), secondary: this.sort(secondary) };
  }

  private sort<T extends Record<'name', string> = Record<'name', string>>(
    items: T[],
  ): T[] {
    return items.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      }
      return -1;
    });
  }
}
