import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
} from '@automagical/contracts/controller-logic';
import {
  HassEventDTO,
  PicoStates,
} from '@automagical/contracts/home-assistant';
import { AutoLogService, InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

/**
 * This service adapts from device specific 5 button remote events to a standardized ControllerStates enum.
 * It also sets up event specific channels event channels
 */
@Injectable()
export class RemoteAdapterService {
  private readonly lookup = new Set<string>();

  constructor(
    @InjectLogger()
    private readonly logger: AutoLogService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Trace()
  public watch(entity_id: string): void {
    if (!entity_id) {
      return;
    }
    if (this.lookup.has(entity_id)) {
      return;
    }
    this.logger.debug(`Watching remote {${entity_id}}`);
    this.eventEmitter.on(`${entity_id}/update`, ({ data }: HassEventDTO) => {
      const state = data.new_state;
      switch (state.state as PicoStates) {
        case PicoStates.up:
          return this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.up),
            ControllerStates.up,
          );
        case PicoStates.down:
          return this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.down),
            ControllerStates.down,
          );
        case PicoStates.on:
          return this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.on),
            ControllerStates.on,
          );
        case PicoStates.off:
          return this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.off),
            ControllerStates.off,
          );
        case PicoStates.favorite:
          return this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.favorite),
            ControllerStates.favorite,
          );
        case PicoStates.none:
          return this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.none),
            ControllerStates.none,
          );
      }
    });
    this.lookup.add(entity_id);
  }
}
