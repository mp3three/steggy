import { INestApplication } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { LibraryModule, RegisterCache } from '@text-based/utilities';

import { LIB_TTY } from '../config';
import { InquirerPrompt } from '../decorators';
import {
  BooleanEditorService,
  ChartingService,
  ColorsService,
  ComparisonToolsService,
  ConfigBuilderService,
  DateEditorService,
  EnumEditorService,
  EnvironmentService,
  FooterEntryService,
  GitService,
  KeymapService,
  MainCLIService,
  NumberEditorService,
  PinnedItemService,
  PromptService,
  ReplExplorerService,
  StringEditorService,
  SystemService,
  TableService,
  TextRenderingService,
} from '../services';

@LibraryModule({
  exports: [
    ChartingService,
    ColorsService,
    ComparisonToolsService,
    ConfigBuilderService,
    EnvironmentService,
    FooterEntryService,
    GitService,
    PinnedItemService,
    PromptService,
    SystemService,
    TableService,
    KeymapService,
    TextRenderingService,
  ],
  imports: [DiscoveryModule, RegisterCache()],
  library: LIB_TTY,
  providers: [
    BooleanEditorService,
    ChartingService,
    ColorsService,
    ComparisonToolsService,
    KeymapService,
    ConfigBuilderService,
    DateEditorService,
    EnumEditorService,
    EnvironmentService,
    FooterEntryService,
    GitService,
    MainCLIService,
    NumberEditorService,
    PinnedItemService,
    PromptService,
    ReplExplorerService,
    StringEditorService,
    SystemService,
    TableService,
    TextRenderingService,
  ],
})
export class MainCLIModule {
  protected onPostInit(app: INestApplication): void {
    InquirerPrompt['forRoot'](app);
  }
}
