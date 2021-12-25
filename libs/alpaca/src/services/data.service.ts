import { AutoLogService, CastResult } from '@for-science/utilities';
import { Injectable } from '@nestjs/common';

import {
  GetBarsPayloadDTO,
  GetQuotes,
  GetTrades,
  PageOfBarsDTO,
  PageOfQuotesDTO,
  PageOfTradesDTO,
} from '../contracts';
import { SnapshotDTO } from '../contracts/snapshot.dto';
import { AlpacaFetchService } from './alpaca-fetch.service';

@Injectable()
export class DataService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: AlpacaFetchService,
  ) {}

  @CastResult(PageOfBarsDTO)
  public async getBars(
    symbol: string,
    body: GetBarsPayloadDTO,
  ): Promise<PageOfBarsDTO> {
    return await this.fetchService.fetch({
      body,
      url: `/stocks/${symbol}/bars`,
    });
  }

  @CastResult(PageOfQuotesDTO)
  public async getQuote(
    symbol: string,
    body: GetQuotes,
  ): Promise<PageOfQuotesDTO> {
    return await this.fetchService.fetch({
      params: { ...body },
      url: `/stocks/${symbol}/quotes`,
    });
  }

  @CastResult(SnapshotDTO)
  public async getSnapshot(symbol: string): Promise<SnapshotDTO> {
    return await this.fetchService.fetch({
      url: `/stocks/${symbol}/snapshot`,
    });
  }

  @CastResult(SnapshotDTO, { record: true })
  public async getSnapshots(
    symbols: string[],
  ): Promise<Record<string, SnapshotDTO>> {
    return await this.fetchService.fetch({
      params: { symbols: symbols.join(',') },
      url: `/stocks/snapshots`,
    });
  }

  @CastResult(PageOfTradesDTO)
  public async getTrades(
    symbol: string,
    trades: GetTrades,
  ): Promise<PageOfTradesDTO> {
    return await this.fetchService.fetch({
      params: { ...trades },
      url: `/stocks/${symbol}/trades`,
    });
  }
}
