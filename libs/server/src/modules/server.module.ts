import {
  AutoLogService,
  BootstrapOptions,
  InjectConfig,
  LIB_SERVER,
  LibraryModule,
} from '@automagical/utilities';
import {
  INestApplication,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
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
import { BasicExceptionFilter } from '../filters';
import { AdminKeyGuard, IsAuthorizedGuard } from '../guards';
import { LoggingInterceptor } from '../interceptors';
import { InitMiddleware } from '../middleware';
import { RouteInjector } from '../services';

@LibraryModule({
  exports: [RouteInjector],
  library: LIB_SERVER,
  providers: [
    AdminKeyGuard,
    RouteInjector,
    BasicExceptionFilter,
    IsAuthorizedGuard,
    LoggingInterceptor,
    InitMiddleware,
  ],
})
export class ServerModule {
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

  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(InitMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: '*' });
  }

  protected onPostInit(
    app: INestApplication,
    server: Express,
    { http }: BootstrapOptions,
  ): void {
    if (!http) {
      this.logger.error(`http disabled`);
      return;
    }
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

  protected onPreInit(app: INestApplication): void {
    const interceptor = app.get(LoggingInterceptor);
    const filter = app.get(BasicExceptionFilter);
    app.useGlobalFilters(filter);
    app.useGlobalInterceptors(interceptor);
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
