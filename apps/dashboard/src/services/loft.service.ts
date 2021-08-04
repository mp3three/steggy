import { SEND_ROOM_STATE } from '@automagical/contracts/utilities';
import { RefreshAfter } from '@automagical/terminal';
import { InjectMQTT } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { box as Box, button as Button, Widgets } from 'blessed';
import { Client } from 'mqtt';

import { BLESSED_GRID, GridElement, Workspace } from '../typings';
import { WorkspaceService } from './workspace.service';

const BUTTON_SETTINGS = {
  align: 'center',
  height: 'shrink',
  left: 2,
  mouse: true,
  padding: {
    bottom: 1,
    left: 10,
    right: 10,
    top: 1,
  },
} as Widgets.ButtonOptions;

@Injectable()
export class LoftService implements Workspace {
  // #region Object Properties

  public readonly menuPosition = ['Room Controller', 'Loft'];

  private BOX: Widgets.BoxElement;
  private buttons: Widgets.ButtonElement[] = [];
  private position = 2;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly GRID: GridElement,
    @InjectMQTT() private readonly mqttClient: Client,
    private readonly workspaceService: WorkspaceService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @RefreshAfter()
  public toggleVisibility(): void {
    this.BOX.toggle();
  }

  // #endregion Public Methods

  // #region Protected Methods

  @RefreshAfter()
  protected onApplicationBootstrap(): void {
    this.BOX = this.workspaceService.addSpace(
      Box,
      {
        hidden: true,
        label: 'Loft State',
      },
      this,
    );
    this.addButton(
      {
        content: 'Area On',
        parent: this.BOX,
        style: {
          bg: 'green',
          fg: 'black',
        },
      },
      () => this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'areaOn')),
    );
    this.addButton(
      {
        content: 'Area Off',
        parent: this.BOX,
        style: {
          bg: 'red',
          fg: 'black',
        },
      },
      () => this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'areaOff')),
    );
    this.addButton(
      {
        content: 'Dim Up',
        parent: this.BOX,
        style: {
          bg: 'cyan',
          fg: 'black',
        },
      },
      () => this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'dimUp')),
    );
    this.addButton(
      {
        content: 'Dim Down',
        parent: this.BOX,
        style: {
          bg: 'yellow',
          fg: 'black',
        },
      },
      () => this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'dimDown')),
    );
    this.addButton(
      {
        content: 'Favorite',
        parent: this.BOX,
        style: {
          bg: 'magenta',
          fg: 'black',
        },
      },
      () => this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'favorite')),
    );
  }

  // #endregion Protected Methods

  // #region Private Methods

  private addButton(
    settings: Widgets.ButtonOptions,
    callback: () => Promise<void> | void | unknown,
  ): void {
    const button = Button({
      ...BUTTON_SETTINGS,
      ...settings,
      top: this.position,
    });
    this.position += 4;
    button.on('press', () => {
      callback();
    });
    this.buttons.push(button);
  }

  // #endregion Private Methods
}
