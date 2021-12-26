/* eslint-disable @typescript-eslint/no-magic-numbers */

import { Injectable } from '@nestjs/common';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { FetchService } from '@text-based/utilities';
import { existsSync, readFileSync } from 'fs';

import { MongoConnectDTO } from '../contracts';

@Injectable()
export class ConnectService {
  constructor(private readonly fetchService: FetchService) {}

  public async buildConnectionUri(
    options: MongoConnectDTO,
  ): Promise<MongooseModuleOptions> {
    let sslCert: string;
    let sslKey: string;
    let sslValidate: boolean;
    let sslCRL: string;
    let sslCA: string;

    if (options.cert) {
      sslCert = await this.resolveUrl(options.cert);
    }
    if (options.key) {
      sslKey = await this.resolveUrl(options.key);
    }
    if (options.ca) {
      sslValidate = true;
      sslCA = await this.resolveUrl(options.ca);
    }
    if (options.crl) {
      sslCRL = await this.resolveUrl(options.crl);
    }

    return {
      connectTimeoutMS: 300_000,
      socketTimeoutMS: 300_000,
      sslCA,
      sslCRL,
      sslCert,
      sslKey,
      sslValidate,
      uri: options.uri,
      useNewUrlParser: true,
    };
  }

  private async resolveUrl(url: string): Promise<string> {
    if (url.slice(0, 4) === 'http') {
      return await this.fetchService.fetch({
        rawUrl: true,
        url,
      });
    }
    if (existsSync(url)) {
      return readFileSync(url, 'utf-8');
    }
    return url;
  }
}
