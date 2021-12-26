import { CastResult } from '@text-based/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';

import { Watchlist } from '../contracts';
import { AlpacaFetchService } from './alpaca-fetch.service';

@Injectable()
export class WatchlistService {
  constructor(private readonly fetchService: AlpacaFetchService) {}

  @CastResult(Watchlist)
  public async addTo(list: string, symbol: string): Promise<Watchlist> {
    return await this.fetchService.fetch({
      body: { symbol },
      method: 'post',
      url: `/watchlists/${list}`,
    });
  }

  @CastResult(Watchlist)
  public async create(name: string, symbols: string[]): Promise<Watchlist[]> {
    return await this.fetchService.fetch({
      body: { name, symbols },
      method: 'post',
      url: `/watchlists`,
    });
  }

  public async delete(id: string): Promise<boolean> {
    return await this.fetchService.fetch({
      method: 'delete',
      process: false,
      url: `/watchlists/${id}`,
    });
  }

  @CastResult(Watchlist)
  public async get(id: string): Promise<Watchlist> {
    return await this.fetchService.fetch({
      url: `/watchlists/${id}`,
    });
  }

  @CastResult(Watchlist)
  public async list(): Promise<Watchlist[]> {
    return await this.fetchService.fetch({
      url: `/watchlists`,
    });
  }

  public async removeFrom(list: string, symbol: string): Promise<boolean> {
    return await this.fetchService.fetch({
      method: 'delete',
      url: `/watchlists/${list}/${symbol}`,
    });
  }

  @CastResult(Watchlist)
  public async update(
    list: string,
    name: string,
    symbols: string[],
  ): Promise<Watchlist> {
    return await this.fetchService.fetch({
      body: { name, symbols },
      method: 'put',
      url: `/watchlists/${list}`,
    });
  }
}
