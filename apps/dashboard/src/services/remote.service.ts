import { RoomControllerParametersDTO } from '@automagical/contracts/controller-logic';
import {
  BLESSED_GRID,
  Box,
  Button,
  GridElement,
} from '@automagical/contracts/terminal';
import { SEND_ROOM_STATE } from '@automagical/contracts/utilities';
import { WorkspaceElement } from '@automagical/terminal';
import { MqttService } from '@automagical/utilities';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Widgets } from 'blessed';

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
    private readonly mqttClient: MqttService,
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
    });
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
          bg: 'white',
          fg: 'black',
        },
        top: this.position,
      },
      () =>
        this.mqttClient.publish(
          SEND_ROOM_STATE(this.room, 'areaOn'),
          JSON.stringify({ count: 2 } as RoomControllerParametersDTO),
        ),
    );
    this.addButton(
      {
        content: 'Area Off',
        left: 35,
        parent: this.BOX,
        style: {
          bg: 'white',
          fg: 'black',
        },
        top: this.position,
      },
      () =>
        this.mqttClient.publish(
          SEND_ROOM_STATE(this.room, 'areaOff'),
          JSON.stringify({ count: 2 } as RoomControllerParametersDTO),
        ),
    );
    this.addButton(
      {
        content: 'Dim Up',
        parent: this.BOX,
        style: {
          bg: 'white',
          fg: 'black',
        },
        top: 4 + this.position,
      },
      () =>
        this.mqttClient.publish(
          SEND_ROOM_STATE(this.room, 'dimUp'),
          JSON.stringify({}),
        ),
    );
    this.addButton(
      {
        content: 'Dim Down',
        left: 35,
        parent: this.BOX,
        style: {
          bg: 'white',
          fg: 'black',
        },
        top: 4 + this.position,
      },
      () =>
        this.mqttClient.publish(
          SEND_ROOM_STATE(this.room, 'dimDown'),
          JSON.stringify({}),
        ),
    );
    this.addButton(
      {
        content: 'Favorite',
        parent: this.BOX,
        style: {
          bg: 'white',
          fg: 'black',
        },
        top: 8 + this.position,
      },
      () =>
        this.mqttClient.publish(
          SEND_ROOM_STATE(this.room, 'favorite'),
          JSON.stringify({ count: 2 } as RoomControllerParametersDTO),
        ),
    );
  }

  // #endregion Protected Methods
}
