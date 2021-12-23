import { CastResult } from '@for-science/utilities';
import { Injectable } from '@nestjs/common';

import { CalendarDTO, ClockDTO } from '../contracts';
import { AlpacaFetchService } from './alpaca-fetch.service';

@Injectable()
export class UtilitiesService {
  constructor(private readonly fetchService: AlpacaFetchService) {}

  @CastResult(CalendarDTO)
  public async calendar(range: {
    end: Date;
    start?: Date;
  }): Promise<CalendarDTO[]> {
    return await this.fetchService.fetch({
      params: range,
      url: `/calendar`,
    });
  }

  @CastResult(ClockDTO)
  public async clock(): Promise<ClockDTO> {
    return await this.fetchService.fetch({ url: `/clock` });
  }
}
