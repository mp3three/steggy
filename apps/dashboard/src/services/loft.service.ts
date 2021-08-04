import { SEND_ROOM_STATE } from '@automagical/contracts/utilities';
import { InjectMQTT } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { button as Button, Widgets } from 'blessed';
import { Client } from 'mqtt';

import { LoadWorkspace } from '../decorators/workspace.decorator';
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
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public hide(): void {
    this.BOX.hide();
  }

  public show(): void {
    this.BOX.show();
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected onApplicationBootstrap(): void {
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
