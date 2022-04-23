import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  DeviceTriggerActivateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { TriggerService } from '@steggy/home-assistant';
import { is } from '@steggy/utilities';
import { parse } from 'ini';

type tWatchType = {
  remove: () => void;
  routine: string;
};

@Injectable()
export class DeviceTriggerActivateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly triggerService: TriggerService,
  ) {}

  private WATCHERS = new Set<tWatchType>();

  public clearRoutine({ _id }: RoutineDTO): void {
    this.WATCHERS.forEach(item => {
      if (item.routine === _id) {
        item.remove();
        this.WATCHERS.delete(item);
      }
    });
  }

  public reset(): void {
    if (!is.empty(this.WATCHERS)) {
      this.logger.debug(`[reset] Removing {${this.WATCHERS.size}} triggers`);
      this.WATCHERS.forEach(({ remove }) => remove());
    }
    this.WATCHERS = new Set();
  }

  public async watch(
    routine: RoutineDTO,
    activate: DeviceTriggerActivateDTO,
    callback: () => Promise<void>,
  ): Promise<void> {
    const subscription = await this.triggerService.subscribe(
      parse(activate.trigger),
      () => callback(),
    );
    this.WATCHERS.add({
      remove: async () => await this.triggerService.unsubscribe(subscription),
      routine: routine._id,
    });
  }
}
