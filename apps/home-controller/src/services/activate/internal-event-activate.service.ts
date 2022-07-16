import { AutoLogService } from '@steggy/boilerplate';
import {
  ActivationEvent,
  iActivationEvent,
  VMService,
} from '@steggy/controller-sdk';
import {
  InternalEventActivateDTO,
  RoutineActivateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';

type tWatchType = {
  remove: () => void;
  routine: string;
};

@ActivationEvent({
  description:
    'Trigger a routine in response to an (otherwise) internal controller event',
  name: 'Internal Event',
  type: 'internal_event',
})
export class InternalEventChangeService
  implements iActivationEvent<InternalEventActivateDTO>
{
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
    { activate }: RoutineActivateDTO<InternalEventActivateDTO>,
    callback: () => Promise<void>,
  ): void {
    const process = async (data: Record<string, unknown>) => {
      if (!is.empty(activate.validate)) {
        const result = await this.vmService.fetch(
          activate.validate,
          data,
          activate.logContext,
        );
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
