/* eslint-disable @typescript-eslint/no-magic-numbers */

import { Injectable } from '@nestjs/common';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { FetchService, InjectConfig } from '@steggy/boilerplate';
import { existsSync, readFileSync } from 'fs';

import {
  MONGO_CA,
  MONGO_CERT,
  MONGO_CRL,
  MONGO_KEY,
  MONGO_URI,
} from '../config';
import { MongoConnectDTO } from '../contracts';

@Injectable()
export class ConnectService {
  constructor(
    private readonly fetchService: FetchService,
    @InjectConfig(MONGO_URI) private readonly URI: string,
    @InjectConfig(MONGO_CERT) private readonly CERT: string,
    @InjectConfig(MONGO_CA) private readonly CA: string,
    @InjectConfig(MONGO_KEY) private readonly KEY: string,
    @InjectConfig(MONGO_CRL) private readonly CRL: string,
  ) {}

  public async build(): Promise<MongooseModuleOptions> {
    return await this.buildConnectionUri({
      ca: this.CA,
      cert: this.CERT,
      crl: this.CRL,
      key: this.KEY,
      uri: this.URI,
    });
  }

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
      return readFileSync(url, 'utf8');
    }
    return url;
  }
}
