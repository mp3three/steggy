import { ConnectService } from '@text-based/persistence';
import { InjectConfig } from '@text-based/utilities';
import { Injectable } from '@nestjs/common';
import { MongooseModuleOptions } from '@nestjs/mongoose';

import {
  MONGO_CA,
  MONGO_CERT,
  MONGO_CRL,
  MONGO_KEY,
  MONGO_URI,
} from '../../config';

@Injectable()
export class DatabaseConnectService {
  constructor(
    @InjectConfig(MONGO_URI) private readonly URI: string,
    @InjectConfig(MONGO_CERT) private readonly CERT: string,
    @InjectConfig(MONGO_CA) private readonly CA: string,
    @InjectConfig(MONGO_KEY) private readonly KEY: string,
    @InjectConfig(MONGO_CRL) private readonly CRL: string,
    private readonly connectService: ConnectService,
  ) {}

  public async build(): Promise<MongooseModuleOptions> {
    return await this.connectService.buildConnectionUri({
      ca: this.CA,
      cert: this.CERT,
      crl: this.CRL,
      key: this.KEY,
      uri: this.URI,
    });
  }
}
