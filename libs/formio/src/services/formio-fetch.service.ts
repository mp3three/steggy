import { Injectable } from '@nestjs/common';
import { FetchService, InjectConfig } from '@steggy/boilerplate';
import { FetchWith } from '@steggy/utilities';

import { API_KEY, JWT_TOKEN, LIVE_ENDPOINT } from '../config';

export type FetchError = { message: string; status: number };

/**
 * This service is the primary entry point for interacting with the API Server
 * It contains methods for interacting with projects, and high level portal interactions
 *
 * For interacting with resources / forms: Resource Service
 * For interacting with submmissions: Submission Service
 * For more nuanced interactions, view ../tools
 */
@Injectable()
export class FormioFetchService {
  constructor(
    @InjectConfig(LIVE_ENDPOINT) private readonly liveEndpoint: string,
    @InjectConfig(API_KEY) private readonly apiKey: string,
    @InjectConfig(JWT_TOKEN) private readonly jwtToken: string,
    private readonly fetchService: FetchService,
  ) {}

  public async fetch<T>(fetch: FetchWith): Promise<T> {
    return await this.fetchService.fetch<T>({
      apiKey: this.apiKey,
      baseUrl: this.liveEndpoint,
      jwtToken: this.jwtToken,
      ...fetch,
    });
  }
}
