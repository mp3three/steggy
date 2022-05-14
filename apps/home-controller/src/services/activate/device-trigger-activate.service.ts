import { AutoLogService } from '@steggy/boilerplate';
import { ActivationEvent, iActivationEvent } from '@steggy/controller-sdk';
import {
  DeviceTriggerActivateDTO,
  RoutineActivateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { TriggerService } from '@steggy/home-assistant';
import { is } from '@steggy/utilities';
import { load } from 'js-yaml';

type tWatchType = {
  remove: () => void;
  routine: string;
};

@ActivationEvent({
  description:
    '(EXPERIMENTRAL) Use a Home Assistant trigger as an activation event',
  name: 'Device trigger',
  type: 'device_trigger',
})
export class DeviceTriggerActivateService
  implements iActivationEvent<DeviceTriggerActivateDTO>
{
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
    { activate }: RoutineActivateDTO<DeviceTriggerActivateDTO>,
    callback: () => Promise<void>,
  ): Promise<void> {
    const subscription = await this.triggerService.subscribe(
      load(activate.trigger) as Record<string, unknown>,
      () => callback(),
    );
    this.WATCHERS.add({
      remove: async () => await this.triggerService.unsubscribe(subscription),
      routine: routine._id,
    });
  }
}
