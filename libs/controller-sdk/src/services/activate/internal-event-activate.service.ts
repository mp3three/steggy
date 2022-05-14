import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  InternalEventActivateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';

import { VMService } from '../misc';

type tWatchType = {
  remove: () => void;
  routine: string;
};

@Injectable()
export class InternalEventChangeService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly eventEmitter: EventEmitter,
    private readonly vmService: VMService,
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
      this.logger.debug(
        `[reset] Removing {${this.WATCHERS.size}} watched entities`,
      );
      this.WATCHERS.forEach(({ remove }) => remove());
    }
    this.WATCHERS = new Set();
  }

  public watch(
    routine: RoutineDTO,
    activate: InternalEventActivateDTO,
    callback: () => Promise<void>,
  ): void {
    const process = async (data: Record<string, unknown>) => {
      if (!is.empty(activate.validate)) {
        const result = await this.vmService.exec(activate.validate, data);
        if (!result) {
          return;
        }
      }
      callback();
    };
    this.eventEmitter.on(activate.event, process);
    this.WATCHERS.add({
      remove: () => this.eventEmitter.removeListener(activate.event, process),
      routine: routine._id,
    });
  }
}
