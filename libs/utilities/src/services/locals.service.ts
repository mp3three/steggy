import {
  APIRequest,
  LocalStashDTO,
  ResponseLocals,
} from '@automagical/contracts/server';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Scope,
} from '@nestjs/common';

import { MAX_STASH_DEPTH } from '../config';
import { InjectConfig } from '../decorators/injectors/inject-config.decorator';
import { Trace } from '../decorators/logger.decorator';
import { AutoLogService } from './logger';

const STASH_PROP_LIST = [] as (keyof ResponseLocals)[];

// Working from a hard coded list of properties, does not apply
/* eslint-disable security/detect-object-injection, unicorn/no-process-exit */

@Injectable({ scope: Scope.REQUEST })
export class LocalsService {
  constructor(
    private readonly logger: AutoLogService,
    @Inject(APIRequest) private readonly request: APIRequest,
    @InjectConfig(MAX_STASH_DEPTH) private readonly maxSize: number,
  ) {}

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
    if (locals.stash.length >= this.maxSize) {
      throw new InternalServerErrorException(
        `MAX_STASH_DEPTH exceeded (${this.maxSize})`,
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
}
