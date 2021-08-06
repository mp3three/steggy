import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { Injectable } from '@nestjs/common';
import hash from 'object-hash';
import { get } from 'object-path';

import { InjectCache } from '../decorators/injectors/inject-cache.decorator';
import { Trace } from '../decorators/logger/trace.decorator';
import { CacheManagerService } from './cache-manager.service';

@Injectable()
export class TemplateService {
  // #region Constructors

  constructor(@InjectCache() private cacheManager: CacheManagerService) {}

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
