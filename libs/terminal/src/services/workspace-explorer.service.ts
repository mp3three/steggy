import {
  iWorkspace,
  WORKSPACE_ELEMENT,
  WORKSPACE_SETTINGS,
  WorkspaceElementSettingsDTO,
  WorkspaceSettingsDTO,
} from '@automagical/contracts/terminal';
import { AutoLogService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { EventEmitter2 } from 'eventemitter2';

@Injectable()
export class WorkspaceExplorerService {
  // #region Object Properties

  public readonly elements = new Map<
    iWorkspace,
    Map<string, WorkspaceElementSettingsDTO>
  >();
  public readonly workspaces = new Map<iWorkspace, WorkspaceSettingsDTO>();

  private readonly workspaceByName = new Map<string, iWorkspace>();

  // #endregion Object Properties

  // #region Constructors

  // private readonly elements
  constructor(
    private readonly logger: AutoLogService,
    private readonly discoveryService: DiscoveryService,
    private readonly eventEmitter: EventEmitter2,
    private readonly reflector: Reflector,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    this.discoveryService
      .getProviders()
      .forEach(({ instance }: InstanceWrapper<iWorkspace>) => {
        if (!instance || !instance.constructor[WORKSPACE_SETTINGS]) {
          return;
        }
        const settings = instance.constructor[
          WORKSPACE_SETTINGS
        ] as WorkspaceSettingsDTO;
        const elements = instance.constructor[WORKSPACE_ELEMENT];
        this.workspaces.set(instance, settings);
        this.workspaceByName.set(settings.name, instance);
        this.elements.set(instance, elements);
      });

    this.logger.info(`Workspaces initialized`);
  }

  // #endregion Protected Methods
}
