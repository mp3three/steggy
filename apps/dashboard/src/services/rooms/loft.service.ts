import { BLESSED_SCREEN } from '@automagical/contracts/terminal';
import { SEND_ROOM_STATE } from '@automagical/contracts/utilities';
import { InjectMQTT } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { box as Box, button as Button, Widgets } from 'blessed';
import { Widgets as ContribWidgets } from 'blessed-contrib';
import { Client } from 'mqtt';

import { BLESSED_GRID } from '../../typings';

const BUTTON_SETTINGS = {
  mouse: true,
  padding: {
    bottom: 1,
    left: 10,
    right: 10,
    top: 1,
  },
  shrink: true,
};

@Injectable()
export class LoftService {
  // #region Object Properties

  private BOX: Widgets.BoxElement;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(BLESSED_SCREEN) private readonly SCREEN: Widgets.Screen,
    @Inject(BLESSED_GRID) private readonly GRID: ContribWidgets.GridElement,
    @InjectMQTT() private readonly mqttClient: Client,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onApplicationBootstrap(): void {
    this.BOX = this.GRID.set(0, 0, 4, 2, Box, {
      draggable: true,
      fg: 'green',
      label: 'Loft State',
      scrollable: true,
      tags: true,
    });
    Button({
      content: 'Area On',
      left: 1,
      parent: this.BOX,
      style: {
        bg: 'green',
        fg: 'black',
      },
      ...BUTTON_SETTINGS,
    }).on('press', () => {
      this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'areaOn'));
    });
    Button({
      content: 'Area Off',
      parent: this.BOX,
      right: 1,
      style: {
        bg: 'red',
        fg: 'black',
      },
      ...BUTTON_SETTINGS,
    }).on('press', () => {
      this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'areaOff'));
    });
    Button({
      content: 'Dim Up',
      left: 1,
      parent: this.BOX,
      style: {
        bg: 'cyan',
        fg: 'black',
      },
      top: 4,
      ...BUTTON_SETTINGS,
    }).on('press', () => {
      this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'dimUp'));
    });
    Button({
      content: 'Dim Down',
      parent: this.BOX,
      right: 1,
      style: {
        bg: 'yellow',
        fg: 'black',
      },
      top: 4,
      ...BUTTON_SETTINGS,
    }).on('press', () => {
      this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'dimDown'));
    });
    Button({
      content: 'Favorite',
      left: 'center',
      parent: this.BOX,
      style: {
        bg: 'magenta',
        fg: 'black',
      },
      top: 8,
      ...BUTTON_SETTINGS,
    }).on('press', () => {
      this.mqttClient.publish(...SEND_ROOM_STATE('loft', 'favorite'));
    });
    //
    this.SCREEN.render();
  }

  // #endregion Protected Methods
}
