import { LIB_SERVER } from '@formio/contracts/constants';
import { ResultControlDTO } from '@formio/contracts/fetch';
import { InjectLogger, queryToControl } from '@formio/utilities';
import { Injectable, PipeTransform } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class QueryToControlPipe implements PipeTransform {
  // #region Constructors

  constructor(
    @InjectLogger(QueryToControlPipe, LIB_SERVER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public transform(value: Record<string, string>): ResultControlDTO {
    return queryToControl(value as Record<string, string>);
  }

  // #endregion Public Methods
}
