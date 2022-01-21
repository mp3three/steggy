import { Injectable } from '@nestjs/common';
import { AutoLogService, CastResult } from '@text-based/boilerplate';
import { is } from '@text-based/utilities';

import {
  AccountConfigurationsDTO,
  AccountDTO,
  Activity,
  AssetDTO,
  GetAccountActivities,
  GetPortfolioHistory,
  PortfolioHistoryDTO,
  UpdateAccountPayloadDTO,
} from '../contracts';
import { AlpacaFetchService } from './alpaca-fetch.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: AlpacaFetchService,
  ) {}

  @CastResult(AccountDTO)
  public async get(): Promise<AccountDTO> {
    return await this.fetchService.fetch({ url: `/account` });
  }

  // TODO: CastResult on union types
  public async getActivities({
    activity_type,
    ...parameters
  }: GetAccountActivities): Promise<Activity[]> {
    if (Array.isArray(parameters.activity_types)) {
      parameters.activity_types = parameters.activity_types.join(`,`);
    }
    return await this.fetchService.fetch({
      params: {
        ...(parameters as Omit<
          GetAccountActivities,
          'activity_type' | 'activity_types'
        >),
        activity_type: Array.isArray(parameters.activity_types)
          ? parameters.activity_types.join(`,`)
          : parameters.activity_types,
      },
      url: `/account/activities${activity_type ? `/${activity_type}` : ``}`,
    });
  }

  @CastResult(AssetDTO)
  public async getAsset(id: string): Promise<AssetDTO> {
    return await this.fetchService.fetch({
      url: `/assets/${id}`,
    });
  }

  @CastResult(AccountConfigurationsDTO)
  public async getConfigurations(): Promise<AccountConfigurationsDTO> {
    return await this.fetchService.fetch({ url: `/account/configurations` });
  }

  @CastResult(PortfolioHistoryDTO)
  public async history(
    parameters: GetPortfolioHistory,
  ): Promise<PortfolioHistoryDTO> {
    return await this.fetchService.fetch({
      params: { ...parameters },
      url: `/account/portfolio/history`,
    });
  }

  /**
   * Only observed asset class so far is us_equity
   *
   * Param seems
   */
  @CastResult(AssetDTO)
  public async listAssets(asset_class?: string): Promise<AssetDTO[]> {
    const parameters: Record<string, string> = { status: 'active' };
    if (!is.empty(asset_class)) {
      parameters.asset_class = asset_class;
    }
    return await this.fetchService.fetch({
      params: parameters,
      url: `/assets`,
    });
  }

  @CastResult(AccountConfigurationsDTO)
  public async update(
    body: UpdateAccountPayloadDTO,
  ): Promise<AccountConfigurationsDTO> {
    return await this.fetchService.fetch({
      body,
      method: 'patch',
      url: `/account/configurations`,
    });
  }
}
