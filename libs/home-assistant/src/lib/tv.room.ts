import fetch from 'node-fetch';
import { Logger } from '../../../logger/src';
import { BaseEntity } from './entities/base.entity';
import { RokuInputs, SceneRoom, SceneRoomConfig } from './scene.room';
import { sleep } from '@automagical/utilities';

export type TVRoomConfig = SceneRoomConfig & {
  config: {
    roku: {
      defaultChannel: RokuInputs | string;
      host: string;
    };
  };
};

export abstract class TVRoom extends SceneRoom {
  // #region Object Properties

  protected rokuChannel: RokuInputs | string = null;
  protected roomConfig: TVRoomConfig = null;

  private readonly _logger = Logger(TVRoom);

  // #endregion Object Properties

  // #region Public Methods

  public async setRoku(channel: RokuInputs | string) {
    this._logger.info(`${this.friendlyName} roku => ${channel}`);
    const { host } = this.roomConfig.config.roku;

    this.rokuChannel = channel;
    // Because fuck working the first time you ask for something
    if (channel === 'off') {
      return this.fetch(`${host}/keypress/PowerOff`);
    }
    let input = channel as string;
    if (channel.substr(0, 4) === 'hdmi') {
      input = `tvinput.${channel}`;
    }
    return this.fetch(`${host}/launch/${input}`);
  }

  public async smart(args) {
    await super.smart(args);
    const defaultRokuChannel = this.roomConfig.config.roku.defaultChannel;
    if (['off', defaultRokuChannel].includes(this.rokuChannel)) {
      this.setRoku(defaultRokuChannel);
    }
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async fetch(url) {
    this._logger.debug(url);
    if (
      process.env.NODE_ENV === 'development' ||
      BaseEntity.DISABLE_INTERACTIONS
    ) {
      return;
    }
    await fetch(url, { method: 'POST' });
    await sleep(50);
    await fetch(url, { method: 'POST' });
  }

  protected async onModuleInit() {
    await super.onModuleInit();
    this.on(`scene:off`, () => this.setRoku(RokuInputs.off));
  }

  // #endregion Protected Methods
}
