import { LibraryModule, RegisterCache } from '@for-science/utilities';
import { INestApplication } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { LIB_TTY } from '../config';
import { inquirerPreInit } from '../inquirer';
import {
  ColorsService,
  ConfigBuilderService,
  GitService,
  MainCLIService,
  PinnedItemService,
  PromptService,
  ReplExplorerService,
  SystemService,
  TextRenderingService,
} from '../services';

@LibraryModule({
  exports: [
    ColorsService,
    GitService,
    PinnedItemService,
    PromptService,
    TextRenderingService,
    ConfigBuilderService,
    SystemService,
  ],
  imports: [DiscoveryModule, RegisterCache()],
  library: LIB_TTY,
  providers: [
    ColorsService,
    GitService,
    TextRenderingService,
    MainCLIService,
    PinnedItemService,
    ConfigBuilderService,
    PromptService,
    ReplExplorerService,
    SystemService,
  ],
})
export class MainCLIModule {
  protected onPostInit(app: INestApplication): void {
    inquirerPreInit(app);
  }
}
