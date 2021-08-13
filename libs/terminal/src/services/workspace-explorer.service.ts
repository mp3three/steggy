import {
  iWorkspace,
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

  public readonly elements = new Map<iWorkspace, WorkspaceElementSettingsDTO>();
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
  protected onApplicationBootstrap(): void {
    this.discoveryService
      .getProviders()
      .filter(({ instance }) => !!instance && instance[WORKSPACE_SETTINGS])
      .forEach(({ instance }: InstanceWrapper<iWorkspace>) => {
        const settings = instance[WORKSPACE_SETTINGS] as WorkspaceSettingsDTO;
        this.workspaces.set(instance, settings);
        this.workspaceByName.set(settings.name, instance);
      });

    this.logger.info(`Workspaces initialized`);
  }

  // #endregion Protected Methods
}
