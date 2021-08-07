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
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { PinoLogger } from 'nestjs-pino';

import { LightingControllerService } from './lighting-controller.service';
import { StateManagerService } from './state-manager.service';

@Injectable()
export class RoomExplorerService {
  // #region Object Properties

  public readonly rooms = new Set<InstanceWrapper>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger() private readonly logger: PinoLogger,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly entityManager: EntityManagerService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public finalize(application: INestApplicationContext): void {
    this.rooms.forEach((wrapper) => {
      const { instance } = wrapper;
      instance[LIGHTING_CONTROLLER] = application.get(
        LightingControllerService,
      );
      instance[STATE_MANAGER] = application.get(StateManagerService);
      (instance[STATE_MANAGER] as StateManagerService).controller = instance;
      (instance[STATE_MANAGER] as StateManagerService).settings =
        instance[ROOM_CONTROLLER_SETTINGS];
      (instance[LIGHTING_CONTROLLER] as LightingControllerService).controller =
        instance;
      (instance[LIGHTING_CONTROLLER] as LightingControllerService).settings =
        instance[ROOM_CONTROLLER_SETTINGS];

      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key) => {
          // Inject lighting controllers
          const loadController = this.reflector.get<boolean>(
            LIGHTING_CONTROLLER,
            instance[key],
          );
          if (loadController === true) {
            instance[key] = instance[LIGHTING_CONTROLLER];
            return;
          }
          // Inject entity observables
          const loadEntity = this.reflector.get<string>(
            HASS_ENTITY_ID,
            instance[key],
          );
          if (typeof loadEntity === 'string') {
            instance[key] = this.entityManager.getObservable(loadEntity);
            return;
          }
          // Inject state manager
          const loadState = this.reflector.get<boolean>(
            STATE_MANAGER,
            instance[key],
          );
          if (loadState === true) {
            instance[key] = instance[STATE_MANAGER];
          }
          return true;
        },
      );
    });
  }

  public getController({
    instance,
  }: InstanceWrapper): LightingControllerService {
    return instance[LIGHTING_CONTROLLER];
  }

  public getSettings({ instance }: InstanceWrapper): RoomControllerSettingsDTO {
    return instance[ROOM_CONTROLLER_SETTINGS];
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    providers.forEach((wrapper) => {
      const { instance } = wrapper;
      if (!instance || !instance[ROOM_CONTROLLER_SETTINGS]) {
        return;
      }
      this.addRoom(wrapper);
    });
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private addRoom(wrapper: InstanceWrapper): void {
    const { instance } = wrapper;
    const settings = instance[
      ROOM_CONTROLLER_SETTINGS
    ] as RoomControllerSettingsDTO;

    this.logger.info(`Loading RoomController: ${settings.friendlyName}`);
    this.rooms.add(wrapper);
  }

  // #endregion Private Methods
}
