import { APIRequest, REQUEST_CACHE_PREFIX } from '@formio/contracts/server';
import { CacheInterceptor, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  // #region Public Methods

  public trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<APIRequest>();
    const { locals } = request.res;
    let key = `${REQUEST_CACHE_PREFIX}${request.url}`;
    locals.query.forEach((value, name) => {
      key = `${key}/${name}=${value}`;
    });
    return key;
  }

  // #endregion Public Methods
}
