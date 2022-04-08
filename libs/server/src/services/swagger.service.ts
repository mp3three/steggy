import { INestApplication, Inject, Injectable } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ACTIVE_APPLICATION,
  AutoLogService,
  InjectConfig,
  WorkspaceService,
} from '@steggy/boilerplate';
import { TitleCase } from '@steggy/utilities';

import { SWAGGER_PATH } from '../config';

@Injectable()
export class SwaggerService {
  constructor(
    @Inject(ACTIVE_APPLICATION) private readonly activeApplication: symbol,
    private readonly logger: AutoLogService,
    @InjectConfig(SWAGGER_PATH) private readonly swaggerPath: string,
    private readonly workspaceService: WorkspaceService,
  ) {}

  protected onApplicationBootstrap(): void {
    if (!this.swaggerPath) {
      return;
    }
    this.logger.warn(`Swagger available at {${this.swaggerPath}}`);
  }

  protected onPreInit(app: INestApplication): void {
    if (!this.swaggerPath) {
      return;
    }
    this.workspaceService.initMetadata();
    const data = this.workspaceService.PACKAGES.get(
      this.activeApplication.description,
    );
    const { displayName, description, version } = data ?? {};
    const config = new DocumentBuilder()
      .setTitle(displayName ?? TitleCase(this.activeApplication.description))
      .setDescription(description ?? '')
      .setVersion(version ?? '')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(this.swaggerPath, app, document);
  }
}
