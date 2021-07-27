import {
  HomeAssistantRoomRokuDTO,
  RokuInputs,
} from '@automagical/contracts/home-assistant';
import { HTTP_METHODS } from '@automagical/contracts/utilities';
import {
  FetchService,
  InjectLogger,
  sleep,
  Trace,
} from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PinoLogger } from 'nestjs-pino';

/**
 * Half abandoned side project. Use at your own risk?
 */
@Injectable()
export class RokuService {
  // #region Constructors

  constructor(
    @InjectLogger()
    private readonly logger: PinoLogger,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    private readonly fetchService: FetchService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * At least on my devices, the first request doesn't always work.
   *
   * I think it might be because it's sleeping or something?
   * The double request method seems to work around
   */
  @Trace()
  public async setRoku(
    channel: RokuInputs | string,
    roku: HomeAssistantRoomRokuDTO,
  ): Promise<void> {
    const currentChannel = await this.cacheService.get(roku.host);
    this.logger.info(`setRoku (${roku.host}) ${currentChannel} => ${channel}`);
    if (currentChannel === channel) {
      return;
    }
    await this.cacheService.set(roku.host, channel);
    if (channel === 'off') {
      await this.fetchService.fetch({
        baseUrl: roku.host,
        method: HTTP_METHODS.post,
        process: false,
        url: '/keypress/PowerOff',
      });
      await sleep(100);
      return await this.fetchService.fetch({
        baseUrl: roku.host,
        method: HTTP_METHODS.post,
        process: false,
        url: '/keypress/PowerOff',
      });
    }
    let input = channel as string;
    if (channel.slice(0, 4) === 'hdmi') {
      input = `tvinput.${channel}`;
    }
    await this.fetchService.fetch({
      baseUrl: roku.host,
      method: HTTP_METHODS.post,
      process: false,
      url: `/launch/${input}`,
    });
    await sleep(100);
    return await this.fetchService.fetch({
      baseUrl: roku.host,
      method: HTTP_METHODS.post,
      process: false,
      url: `/launch/${input}`,
    });
  }

  // #endregion Public Methods
}
