import { LIB_SERVER } from '@automagical/contracts/constants';
import { ResultControlDTO } from '@automagical/contracts/fetch';
import { FetchService } from '@automagical/fetch';
import { InjectLogger, queryToControl } from '@automagical/utilities';
import { Injectable, PipeTransform } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class QueryToControlPipe implements PipeTransform {
  // #region Constructors

  constructor(
    @InjectLogger(QueryToControlPipe, LIB_SERVER)
    private readonly logger: PinoLogger,
    private readonly fetchService: FetchService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public transform(value: Record<string, string>): ResultControlDTO {
    return queryToControl(value as Record<string, string>);
  }

  // #endregion Public Methods
}
