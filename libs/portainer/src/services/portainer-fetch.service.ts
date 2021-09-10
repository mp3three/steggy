import { FetchWith } from '@automagical/contracts/utilities';
import { FetchService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PortainerFetchService {
  constructor(private readonly fetchService: FetchService) {}

  public async fetch<T>(fetchWith: FetchWith): Promise<T> {
    return await this.fetchService.fetch({ ...fetchWith });
  }
}
