import { LocalStashDTO, ResponseLocals } from '@automagical/contracts';
import { MAX_STASH_DEPTH } from '@automagical/contracts/config';
import { APIRequest } from '@automagical/contracts/server';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';

import { InjectLogger } from '../decorators/injectors/inject-logger.decorator';
import { Trace } from '../decorators/logger/trace.decorator';
import { AutoConfigService } from './auto-config.service';
import { AutoLogService } from './auto-log.service';

const STASH_PROP_LIST = [
  'action',
  'project',
  'form',
  'submission',
] as (keyof ResponseLocals)[];

// Working from a hard coded list of properties, does not apply
/* eslint-disable security/detect-object-injection, unicorn/no-process-exit */

@Injectable({ scope: Scope.REQUEST })
export class LocalsService {
  // #region Constructors

  constructor(
    @InjectLogger() private readonly logger: AutoLogService,
    @Inject(APIRequest) private readonly request: APIRequest,
    private readonly configService: AutoConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public pop(): void {
    const { locals } = this.request.res;
    if (locals.stash.length === 0) {
      this.logger.fatal('Attempted to pop an empty stack');
      process.exit();
    }
    const stash: LocalStashDTO = locals.stash.pop();
    STASH_PROP_LIST.forEach((property) => {
      stash[property] = locals[property];
      delete locals[property];
    });
    this.request.body = stash.body;
  }

  @Trace()
  public stash(): void {
    const { locals } = this.request.res;
    locals.stash ??= [];
    const maxSize = this.configService.get<number>(MAX_STASH_DEPTH);
    if (locals.stash.length >= maxSize) {
      throw new InternalServerErrorException(
        `MAX_STASH_DEPTH exceeded (${maxSize})`,
      );
    }
    const stash: LocalStashDTO = {
      body: this.request.body,
    };
    STASH_PROP_LIST.forEach((property) => {
      stash[property] = locals[property];
      delete locals[property];
    });
    this.request.body = undefined;
    locals.stash.push(stash);
  }

  // #endregion Public Methods
}
