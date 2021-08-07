import {
  HASS_ENTITY_ID,
  LIGHTING_CONTROLLER,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
  STATE_MANAGER,
} from '@automagical/contracts/controller-logic';
import { EntityManagerService } from '@automagical/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { INestApplicationContext, Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { PinoLogger } from 'nestjs-pino';

import { ComplexLogicService } from './complex-logic.service';
import { LightingControllerService } from './lighting-controller.service';
import { StateManagerService } from './state-manager.service';

@Injectable()
export class RoomExplorerService {
  // #region Object Properties

  public readonly rooms = new Set<InstanceWrapper>();

  public application: INestApplicationContext;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger() private readonly logger: PinoLogger,
    private readonly discoveryService: DiscoveryService,
    private readonly entityManager: EntityManagerService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public getController({
    instance,
  }: InstanceWrapper): LightingControllerService {
    return instance[LIGHTING_CONTROLLER];
  }

  public getSettings({ instance }: InstanceWrapper): RoomControllerSettingsDTO {
    const constructor = instance?.constructor ?? {};
    return constructor[ROOM_CONTROLLER_SETTINGS];
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    providers.forEach(async (wrapper) => {
      const settings = this.getSettings(wrapper);
      if (!settings) {
        return;
      }
      this.rooms.add(wrapper);
      const { instance } = wrapper;
      this.logger.info(`Loading RoomController: ${settings.friendlyName}`);
      const lightingController = await this.application.resolve(
        LightingControllerService,
      );
      const stateManager = await this.application.resolve(StateManagerService);
      const complexLogic = await this.application.resolve(ComplexLogicService);

      instance[LIGHTING_CONTROLLER] = lightingController;
      instance[STATE_MANAGER] = stateManager;

      stateManager.settings = settings;
      stateManager.controller = instance;
      lightingController.settings = settings;
      lightingController.controller = instance;
      complexLogic.settings = settings;
      complexLogic.controller = instance;
      lightingController.init();
      complexLogic.init();

      const { constructor } = instance;
      if (constructor[LIGHTING_CONTROLLER]) {
        this.logger.debug(
          `Inject Lighting Controller => ${settings.friendlyName} ## ${constructor[LIGHTING_CONTROLLER]}`,
        );
        instance[constructor[LIGHTING_CONTROLLER]] = lightingController;
      }
      if (constructor[STATE_MANAGER]) {
        this.logger.debug(
          `Inject Lighting Controller => ${settings.friendlyName} ## ${constructor[STATE_MANAGER]}`,
        );
        instance[constructor[STATE_MANAGER]] = stateManager;
      }
      if (constructor[HASS_ENTITY_ID]) {
        this.logger.debug(
          `Inject Entity {${constructor[HASS_ENTITY_ID].target}} => ${settings.friendlyName} ## ${constructor[HASS_ENTITY_ID].target}`,
        );
        instance[constructor[HASS_ENTITY_ID].target] =
          this.entityManager.getObservable(
            constructor[HASS_ENTITY_ID].entity_id,
          );
      }
    });
  }

  // #endregion Protected Methods
}
