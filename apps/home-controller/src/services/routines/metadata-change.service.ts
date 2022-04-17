import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  JSONFilterService,
  OnEvent,
} from '@steggy/boilerplate';
import {
  MetadataChangeDTO,
  RoomDTO,
  RoutineActivateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { each, is } from '@steggy/utilities';

import { ROOM_METADATA_UPDATED } from '../../typings';
import { RoomService } from '../room.service';

type tWatchType = {
  activate: RoutineActivateDTO<MetadataChangeDTO>;
  callback: () => Promise<void>;
  room: Pick<RoomDTO, 'friendlyName'>;
  routine: string;
};

const CACHE_PREFIX = 'METADATA_CHANGE_';
const CACHE_KEY = (type: string) => `${CACHE_PREFIX}${type}`;

// ? Should the reset / clear also remove latches?
// Leaving as no right now, but do not have a good argument for why

@Injectable()
export class MetadataChangeService {
  constructor(
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    private readonly jsonFilter: JSONFilterService,
    @InjectCache()
    private readonly cacheService: CacheManagerService,
  ) {}

  private WATCHERS = new Set<tWatchType>();

  public clearRoutine({ _id }: RoutineDTO): void {
    this.WATCHERS.forEach(item => {
      if (item.routine === _id) {
        this.WATCHERS.delete(item);
      }
    });
  }

  public reset(): void {
    if (!is.empty(this.WATCHERS)) {
      this.logger.debug(
        `[reset] Removing {${this.WATCHERS.size}} watched entities`,
      );
    }
    this.WATCHERS = new Set();
  }

  public async watch(
    routine: RoutineDTO,
    activate: RoutineActivateDTO<MetadataChangeDTO>,
    callback: () => Promise<void>,
  ): Promise<void> {
    // Look up room name just for logging
    const room = await this.roomService.get(activate.activate.room, false, {
      select: ['friendlyName'],
    });
    this.WATCHERS.add({
      activate,
      callback,
      room,
      routine: routine._id,
    });
  }

  @OnEvent(ROOM_METADATA_UPDATED)
  protected async onMetadataUpdate({
    room,
    name,
    value,
  }: {
    name: string;
    room: string;
    value: unknown;
  }): Promise<void> {
    const testList: tWatchType[] = [];
    this.WATCHERS.forEach(watcher => {
      const item = watcher.activate;
      const activate = item.activate;
      if (activate.room === room && activate.property === name) {
        testList.push(watcher);
      }
    });
    await each(testList, async watcher => {
      const item = watcher.activate;
      const activate = item.activate;
      const shouldExecute = this.jsonFilter.match(
        { value },
        {
          field: 'value',
          ...activate,
        },
      );
      if (!shouldExecute) {
        if (activate.latch) {
          await this.cacheService.del(CACHE_KEY(item.id));
        }
        return;
      }
      if (activate.latch) {
        const exists = await this.cacheService.get(CACHE_KEY(item.id));
        if (exists === item.id) {
          this.logger.debug(
            `Latched ${watcher.room.friendlyName}#${name} = {${value}}`,
          );
          return;
        }
        await this.cacheService.set(CACHE_KEY(item.id), item.id);
      }
      await watcher.callback();
    });
  }
}
