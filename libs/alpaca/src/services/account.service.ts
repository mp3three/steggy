import { AutoLogService, ToClass } from '@for-science/utilities';
import { Injectable } from '@nestjs/common';

import { AccountDTO } from '../contracts';
import { AlpacaFetchService } from './alpaca-fetch.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: AlpacaFetchService,
  ) {}

  @ToClass(AccountDTO)
  public async getAccount(): Promise<AccountDTO> {
    return await this.fetchService.fetch({ url: `/account` });
  }
}
