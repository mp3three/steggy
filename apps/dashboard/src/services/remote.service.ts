import { Box, Button } from '@automagical/contracts/terminal';
import { SEND_ROOM_STATE } from '@automagical/contracts/utilities';
import { InjectMQTT } from '@automagical/utilities';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Widgets } from 'blessed';
import { Client } from 'mqtt';

import { WorkspaceElement } from '../decorators';
import { BLESSED_GRID, GridElement } from '../typings';

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

@Injectable({ scope: Scope.TRANSIENT })
export class RemoteService {
  // #region Object Properties

  @WorkspaceElement()
  public BOX: Widgets.BoxElement;

  public room: string;

  private buttons: Widgets.ButtonElement[] = [];
  private position = 20;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_GRID) private readonly grid: GridElement,
    @InjectMQTT() private readonly mqttClient: Client,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public addButton(
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

  // #endregion Public Methods

  // #region Protected Methods

  protected onModuleInit(): void {
    this.BOX = this.grid.set(0, 2, 12, 8, Box, {
      align: 'center',
      hidden: true,
      padding: {
        bottom: 10,
      },
      valign: 'bottom',
    });
    this.addButton(
      {
        content: 'Area On',
        parent: this.BOX,
        style: {
          bg: 'green',
          fg: 'black',
        },
      },
      () => this.mqttClient.publish(...SEND_ROOM_STATE(this.room, 'areaOn')),
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
      () => this.mqttClient.publish(...SEND_ROOM_STATE(this.room, 'dimUp')),
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
      () => this.mqttClient.publish(...SEND_ROOM_STATE(this.room, 'dimDown')),
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
      () => this.mqttClient.publish(...SEND_ROOM_STATE(this.room, 'areaOff')),
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
      () => this.mqttClient.publish(...SEND_ROOM_STATE(this.room, 'favorite')),
    );
  }

  // #endregion Protected Methods
}
