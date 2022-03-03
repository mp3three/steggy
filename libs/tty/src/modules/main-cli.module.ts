import { LibraryModule, RegisterCache } from '@automagical/boilerplate';
import { INestApplication } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { LIB_TTY } from '../config';
import { InquirerPrompt } from '../decorators';
import { inquirerPreInit } from '../inquirer';
import {
  ApplicationManagerService,
  BooleanEditorService,
  ChartingService,
  ColorsService,
  ComparisonToolsService,
  ComponentExplorerService,
  ConfigBuilderService,
  DateEditorService,
  EnumEditorService,
  EnvironmentService,
  GitService,
  LayoutManagerService,
  MainCLIService,
  NumberEditorService,
  PinnedItemService,
  PromptService,
  ReplExplorerService,
  ScreenService,
  StackService,
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
    GitService,
    ApplicationManagerService,
    PinnedItemService,
    PromptService,
    StackService,
    SystemService,
    ScreenService,
    TableService,
    TextRenderingService,
    ComponentExplorerService,
    LayoutManagerService,
  ],
  imports: [DiscoveryModule, RegisterCache()],
  library: LIB_TTY,
  providers: [
    BooleanEditorService,
    ChartingService,
    ColorsService,
    ComparisonToolsService,
    ConfigBuilderService,
    DateEditorService,
    EnumEditorService,
    EnvironmentService,
    GitService,
    MainCLIService,
    ComponentExplorerService,
    LayoutManagerService,
    StackService,
    NumberEditorService,
    PinnedItemService,
    PromptService,
    ApplicationManagerService,
    ScreenService,
    ReplExplorerService,
    StringEditorService,
    SystemService,
    TableService,
    TextRenderingService,
  ],
})
export class MainCLIModule {
  protected onPostInit(app: INestApplication): void {
    inquirerPreInit(app);
    InquirerPrompt['loadApp'](app);
  }
}
