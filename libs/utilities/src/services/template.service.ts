import { LIB_UTILS } from '@formio/contracts/constants';
import { SubmissionDTO } from '@formio/contracts/formio-sdk';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PinoLogger } from 'nestjs-pino';
import hash from 'object-hash';
import { get } from 'object-path';

import { InjectLogger, Trace } from '../decorators';

@Injectable()
export class TemplateService {
  // #region Constructors

  constructor(
    @InjectLogger(TemplateService, LIB_UTILS)
    private readonly logger: PinoLogger,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async cachedInterpolate(
    rawTemplate: string,
    data: SubmissionDTO,
  ): Promise<string> {
    const templateHash = hash(rawTemplate);
    return await this.cacheManager.wrap(templateHash, (callback) => {
      callback(
        rawTemplate.replace(/({{\s*(.*?)\s*}})/g, (match, tag, path) =>
          get(data, path),
        ),
      );
    });
  }

  @Trace()
  public interpolate(rawTemplate: string, data: SubmissionDTO): string {
    return rawTemplate.replace(/({{\s*(.*?)\s*}})/g, (match, tag, path) =>
      get(data, path),
    );
  }

  // #endregion Public Methods
}
