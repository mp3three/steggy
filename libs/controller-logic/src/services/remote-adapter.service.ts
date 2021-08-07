import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
} from '@automagical/contracts/controller-logic';
import {
  HassEventDTO,
  PicoStates,
} from '@automagical/contracts/home-assistant';
import { InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { PinoLogger } from 'nestjs-pino';

/**
 * This service adapts from device specific 5 button remote events to a standardized ControllerStates enum.
 * It also sets up event specific channels event channels
 */
@Injectable()
export class RemoteAdapterService {
  // #region Object Properties

  private readonly lookup = new Set<string>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger() private readonly logger: PinoLogger,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public watch(entity_id: string): void {
    if (this.lookup.has(entity_id)) {
      return;
    }
    this.eventEmitter.on(`${entity_id}/update`, ({ data }: HassEventDTO) => {
      const state = data.new_state;
      switch (state.state as PicoStates) {
        case PicoStates.up:
          this.logger.debug(`${entity_id} => ControllerStates.up`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.up),
            ControllerStates.up,
          );
          return;
        case PicoStates.down:
          this.logger.debug(`${entity_id} => ControllerStates.down`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.down),
            ControllerStates.down,
          );
          return;
        case PicoStates.on:
          this.logger.debug(`${entity_id} => ControllerStates.on`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.on),
            ControllerStates.on,
          );
          return;
        case PicoStates.off:
          this.logger.debug(`${entity_id} => ControllerStates.off`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.off),
            ControllerStates.off,
          );
          return;
        case PicoStates.favorite:
          this.logger.debug(`${entity_id} => ControllerStates.favorite`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.favorite),
            ControllerStates.favorite,
          );
          return;
        case PicoStates.none:
          this.logger.debug(`${entity_id} => ControllerStates.none`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.none),
            ControllerStates.none,
          );
          return;
      }
    });
    this.lookup.add(entity_id);
  }

  // #endregion Public Methods
}
