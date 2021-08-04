import { Box } from '@automagical/contracts/terminal';
import { SEND_ROOM_STATE } from '@automagical/contracts/utilities';
import { InjectMQTT } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { button as Button, Widgets } from 'blessed';
import chalk from 'chalk';
import figlet from 'figlet';
import { Client } from 'mqtt';

import { LoadWorkspace, WorkspaceElement } from '../decorators';
import { BLESSED_GRID, GridElement, Workspace } from '../typings';

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
@LoadWorkspace()
export class BedroomService implements Workspace {
  // #region Object Properties

  public readonly menuPosition = ['Room Controller', 'Bedroom'];

  @WorkspaceElement()
  private BOX: Widgets.BoxElement;
  @WorkspaceElement()
  private HEADER: Widgets.BoxElement;

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

  public show(): void {
    this.BOX.show();
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected onApplicationBootstrap(): void {
    this.BOX = this.grid.set(0, 2, 12, 8, Box, {
      align: 'center',
      hidden: true,
      padding: {
        bottom: 10,
      },
      valign: 'bottom',
    });
    this.BOX.border = {};
    this.HEADER = this.grid.set(0.5, 2.5, 2, 5, Box, {
      content: chalk.greenBright(
        figlet.textSync('Bedroom', {
          font: 'Electronic',
        }),
      ),
      hidden: true,
    });
    this.HEADER.border = {};
    this.addButton(
      {
        content: 'Area On',
        parent: this.BOX,
        style: {
          bg: 'green',
          fg: 'black',
        },
      },
      () => this.mqttClient.publish(...SEND_ROOM_STATE('master', 'areaOn')),
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
      () => this.mqttClient.publish(...SEND_ROOM_STATE('master', 'dimUp')),
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
      () => this.mqttClient.publish(...SEND_ROOM_STATE('master', 'dimDown')),
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
      () => this.mqttClient.publish(...SEND_ROOM_STATE('master', 'areaOff')),
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
      () => this.mqttClient.publish(...SEND_ROOM_STATE('master', 'favorite')),
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
