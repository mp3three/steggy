import { Injectable } from '@nestjs/common';
import { CastResult } from '@text-based/boilerplate';

import {
  ListOrdersOptions,
  Order,
  OrderCancelationDTO,
  PlaceOrderOptions,
  Position,
  ReplaceOrderOptions,
} from '../contracts';
import { AlpacaFetchService } from './alpaca-fetch.service';

@Injectable()
export class OrderService {
  constructor(private readonly fetchService: AlpacaFetchService) {}

  public async cancelOrder(id: string): Promise<boolean> {
    return await this.fetchService.fetch({
      method: 'delete',
      process: false,
      url: `/orders/${id}`,
    });
  }

  @CastResult(Order)
  public async closePosition(symbol: string, qty?: number): Promise<Order> {
    return await this.fetchService.fetch({
      method: 'delete',
      params: { qty },
      url: `/position/${symbol}`,
    });
  }

  @CastResult(Order)
  public async getOrder(id: string, nested = false): Promise<Order> {
    return await this.fetchService.fetch({
      params: { nested },
      url: `/orders/${id}`,
    });
  }

  @CastResult(Position)
  public async getPosition(symbol: string): Promise<Position> {
    return await this.fetchService.fetch({
      url: `/positions/${symbol}`,
    });
  }

  @CastResult(Order)
  public async listOrders(options: ListOrdersOptions = {}): Promise<Order[]> {
    return await this.fetchService.fetch({
      params: { ...options },
      url: `/orders`,
    });
  }

  @CastResult(Position)
  public async listPositions(): Promise<Position[]> {
    return await this.fetchService.fetch({
      url: `/positions`,
    });
  }

  @CastResult(Order)
  public async place(options: PlaceOrderOptions): Promise<Order> {
    return await this.fetchService.fetch({
      body: options,
      method: 'post',
      url: `/orders`,
    });
  }

  @CastResult(Order)
  public async replace(options: ReplaceOrderOptions): Promise<Order> {
    return await this.fetchService.fetch({
      body: options,
      method: 'patch',
      url: `/orders/${options.order_id}`,
    });
  }

  @CastResult(OrderCancelationDTO)
  public async truncate(): Promise<OrderCancelationDTO[]> {
    return await this.fetchService.fetch({
      method: 'delete',
      url: `/orders`,
    });
  }
}
