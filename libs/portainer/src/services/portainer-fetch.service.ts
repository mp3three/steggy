import { FetchWith } from '@automagical/contracts/utilities';
import { AutoConfigService, FetchService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PortainerFetchService {
  // #region Constructors

  constructor(
    private readonly fetchService: FetchService,
    private readonly configService: AutoConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async fetch<T>(fetchWith: FetchWith): Promise<T> {
    return await this.fetchService.fetch({ ...fetchWith });
  }

  // #endregion Public Methods
}
