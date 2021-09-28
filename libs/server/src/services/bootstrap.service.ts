import { AutoLogService, InjectConfig } from '@automagical/utilities';
import { INestApplication, Injectable } from '@nestjs/common';
import compression from 'compression';
import { Express, json } from 'express';
import { readFileSync } from 'fs';
import helmet from 'helmet';
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';

import {
  BODY_SIZE,
  COMPRESSION,
  GLOBAL_PREFIX,
  PORT,
  SSL_CERT,
  SSL_KEY,
  SSL_PORT,
} from '../config';

@Injectable()
export class BootstrapService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(GLOBAL_PREFIX)
    private readonly prefix: string,
    @InjectConfig(BODY_SIZE)
    private readonly limit: string,
    @InjectConfig(COMPRESSION)
    private readonly compression: boolean,
    @InjectConfig(PORT)
    private readonly port: number,
    @InjectConfig(SSL_PORT)
    private readonly sslPort: number,
    @InjectConfig(SSL_KEY)
    private readonly sslKey: string,
    @InjectConfig(SSL_CERT)
    private readonly sslCert: string,
  ) {}

  public onPostInit(server: Express, app: INestApplication): void {
    app.use(helmet());
    if (this.prefix) {
      this.logger.debug(`Using global http prefix {${this.prefix}}`);
      app.setGlobalPrefix(this.prefix);
    }
    app.use(json({ limit: this.limit }));
    if (this.compression) {
      app.use(compression());
    }
    const listening = this.listenHttp(server);
    if (this.sslPort) {
      this.listenSsl(server);
      return;
    }
    if (!listening) {
      this.logger.error(`No port to listen on`);
    }
  }

  private listenHttp(server: Express): boolean {
    if (this.port) {
      createServer(server).listen(this.port, () =>
        this.logger.info(`📡 Listening on [${this.port}] {(http)} 📡`),
      );
      return true;
    }
    return false;
  }

  private listenSsl(server: Express): void {
    const key = readFileSync(this.sslKey, 'utf-8');
    const cert = readFileSync(this.sslCert, 'utf-8');
    if (!key) {
      throw new Error(`Bad ssl key`);
    }
    if (!cert) {
      throw new Error(`Bad ssl cert`);
    }
    createHttpsServer(
      {
        cert,
        key,
      },
      server,
    ).listen(this.sslPort, () =>
      this.logger.info(`📡 Listening on [${this.sslPort}] {(https)} 📡`),
    );
  }
}
