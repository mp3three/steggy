import { DEFAULT_HEADER_FONT } from '@automagical/contracts/config';
import { iRoomControllerMethods } from '@automagical/contracts/controller-logic';
import {
  BLESSED_GRID,
  Box,
  BoxElement,
  Button,
  FigletFonts,
  GridElement,
  iWorkspace,
  WORKSPACE_ELEMENT,
  WORKSPACE_SETTINGS,
  WorkspaceElementSettingsDTO,
  WorkspaceSettingsDTO,
} from '@automagical/contracts/terminal';
import { SEND_ROOM_STATE } from '@automagical/contracts/utilities';
import {
  AutoConfigService,
  AutoLogService,
  MqttService,
  Trace,
} from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import chalk from 'chalk';
import figlet from 'figlet';

import { FontAwesomeIcons, MDIIcons } from '../icons';

type WorkspaceElements = Map<string, WorkspaceElementSettingsDTO>;
@Injectable()
export class WorkspaceExplorerService {
  // #region Object Properties

  public readonly elements = new Map<
    iWorkspace,
    Map<string, WorkspaceElementSettingsDTO>
  >();
  public readonly internalElements = new Map<iWorkspace, BoxElement[]>();
  public readonly workspaces = new Map<iWorkspace, WorkspaceSettingsDTO>();

  private readonly workspaceByName = new Map<string, iWorkspace>();

  // #endregion Object Properties

  // #region Constructors

  // private readonly elements
  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    private readonly logger: AutoLogService,
    private readonly configService: AutoConfigService,
    private readonly discoveryService: DiscoveryService,
    private readonly mqtt: MqttService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Trace()
  protected onApplicationBootstrap(): void {
    this.discoveryService
      .getProviders()
      .forEach(({ instance }: InstanceWrapper<iWorkspace>) => {
        if (!instance || !instance.constructor[WORKSPACE_SETTINGS]) {
          return;
        }
        const settings = instance.constructor[
          WORKSPACE_SETTINGS
        ] as WorkspaceSettingsDTO;
        instance.constructor[WORKSPACE_ELEMENT] ??= new Map();
        const elements = instance.constructor[
          WORKSPACE_ELEMENT
        ] as WorkspaceElements;
        this.workspaces.set(instance, settings);
        this.workspaceByName.set(settings.name, instance);
        this.remote(settings, instance);
        this.header(settings, instance);
        this.elements.set(instance, elements);
      });

    this.logger.info(`Workspaces initialized`);
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private header(settings: WorkspaceSettingsDTO, instance: iWorkspace): void {
    if (settings.customHeader) {
      return;
    }
    const elements = this.internalElements.get(instance) ?? [];
    const header = this.grid.set(0.5, 2.5, 2, 6, Box, {
      content: chalk.yellowBright(
        figlet.textSync(settings.friendlyName, {
          // TODO: Make into config variable
          font: this.configService.get<figlet.Fonts>(DEFAULT_HEADER_FONT),
        }),
      ),
      hidden: true,
    });
    header.border = {};
    elements.push(header);
    this.internalElements.set(instance, elements);
  }

  @Trace()
  private remote(settings: WorkspaceSettingsDTO, instance: iWorkspace) {
    if (!settings.roomRemote) {
      return;
    }
    const elements = this.internalElements.get(instance) ?? [];
    const remote = new Map<
      string,
      {
        command: keyof iRoomControllerMethods;
        left?: number;
      }
    >([
      [`${MDIIcons.lightbulb_on} Area On`, { command: 'areaOn' }],
      [`${MDIIcons.lightbulb_on_outline} Area Off`, { command: 'areaOff' }],
      [`${MDIIcons.chevron_double_up} Dim Up`, { command: 'dimUp', left: 1 }],
      [
        `${MDIIcons.chevron_double_down} Dim Down`,
        { command: 'dimDown', left: -1 },
      ],
      [
        `${FontAwesomeIcons.crosshairs} Favorite`,
        { command: 'favorite', left: 1 },
      ],
    ]);
    const box = this.grid.set(0, 2, 12, 8, Box, {
      align: 'center',
      hidden: true,
      padding: {
        bottom: 10,
      },
      valign: 'bottom',
    });
    box.border = {};
    elements.push(box);
    let left = 2;
    remote.forEach((action, label) => {
      left += action.left ?? 0;
      const button = Button({
        align: 'center',
        content: chalk.bold(label),
        height: 'shrink',
        left,
        mouse: true,
        padding: {
          bottom: 0,
          left: 5,
          right: 5,
          top: 0,
        },
        parent: box,
        style: {
          bg: 'blue',
          fg: 'white',
        },
      });
      left += 20;
      button.on('press', () => {
        this.mqtt.publish(
          SEND_ROOM_STATE(settings.name, action.command),
          JSON.stringify({ count: 2 }),
        );
      });
    });
    this.internalElements.set(instance, elements);
  }

  // #endregion Private Methods
}
