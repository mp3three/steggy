import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
} from '@automagical/contracts/controller-logic';
import {
  HassEventDTO,
  PicoStates,
} from '@automagical/contracts/home-assistant';
import { EntityManagerService } from '@automagical/home-assistant';
import { InjectLogger } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class RemoteAdapterService {
  // #region Object Properties

  private readonly lookup = new Set<string>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger() private readonly logger: PinoLogger,
    private readonly entityManagerService: EntityManagerService,
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
          );
          return;
        case PicoStates.down:
          this.logger.debug(`${entity_id} => ControllerStates.down`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.down),
          );
          return;
        case PicoStates.on:
          this.logger.debug(`${entity_id} => ControllerStates.on`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.on),
          );
          return;
        case PicoStates.off:
          this.logger.debug(`${entity_id} => ControllerStates.off`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.off),
          );
          return;
        case PicoStates.favorite:
          this.logger.debug(`${entity_id} => ControllerStates.favorite`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.favorite),
          );
          return;
        case PicoStates.none:
          this.logger.debug(`${entity_id} => ControllerStates.none`);
          this.eventEmitter.emit(
            CONTROLLER_STATE_EVENT(entity_id, ControllerStates.none),
          );
          return;
      }
    });
    this.lookup.add(entity_id);
  }

  // #endregion Public Methods
}
