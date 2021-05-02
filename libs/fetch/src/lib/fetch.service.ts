import { LIB_FETCH } from '@automagical/contracts/constants';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import fetch from 'node-fetch';
import { FetchArguments } from '../typings';
import { BaseFetch } from './base-fetch.service';

@Injectable()
export class FetchService extends BaseFetch {
  // #region Object Properties

  public TRUNCATE_LENGTH = 200;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(FetchService, LIB_FETCH)
    protected readonly logger: PinoLogger,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  /**
   * > ⚠️⚠️ See README @ libs/formio-sdk/README.md ⚠️⚠️
   *
   * ## TL;DR
   *
   * Big wrapper around node-fetch, does a lot of magic to convert args into a format node-fetch can work with.
   * Hopefully with the side effect of making for more simpler reading end code, and keeping the complexity inside the lib.
   * The intent is to have a most layman understandable interface here.
   *
   * All requests from this code base are routed through this function so they can take advantage of the automatic url resolution.
   * The post-processing steps are optional, but will be expanded upon in the future.
   *
   * ### Feature Goals
   *
   * - Exporting all requests as curl request
   * - Exporting as postman compatible (convert a quick script into e2e tests?)
   */
  @Trace()
  public async fetch<T>(arguments_: Partial<FetchArguments>): Promise<T> {
    const url: string = await this.fetchCreateUrl(arguments_);
    const requestInit = await this.fetchCreateMeta(arguments_);
    try {
      const response = await fetch(url, requestInit);
      return await this.fetchHandleResponse(arguments_, response);
    } catch (error) {
      this.logger.error(error);
      return undefined;
    }
  }

  // #endregion Public Methods
}
