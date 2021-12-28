import { INestApplication } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { LibraryModule, RegisterCache } from '@text-based/utilities';

import { LIB_TTY } from '../config';
import { inquirerPreInit } from '../inquirer';
import {
  ChartingService,
  ColorsService,
  ConfigBuilderService,
  GitService,
  MainCLIService,
  PinnedItemService,
  PromptService,
  ReplExplorerService,
  SystemService,
  TableService,
  TextRenderingService,
} from '../services';

@LibraryModule({
  exports: [
    ChartingService,
    ColorsService,
    ConfigBuilderService,
    GitService,
    PinnedItemService,
    PromptService,
    SystemService,
    TableService,
    TextRenderingService,
  ],
  imports: [DiscoveryModule, RegisterCache()],
  library: LIB_TTY,
  providers: [
    ChartingService,
    ColorsService,
    ConfigBuilderService,
    GitService,
    MainCLIService,
    PinnedItemService,
    PromptService,
    ReplExplorerService,
    SystemService,
    TableService,
    TextRenderingService,
  ],
})
export class MainCLIModule {
  protected onPostInit(app: INestApplication): void {
    inquirerPreInit(app);
  }
}
