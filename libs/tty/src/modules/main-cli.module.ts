import { INestApplication } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { LibraryModule, RegisterCache } from '@text-based/utilities';
import inquirer from 'inquirer';
import datePrompt from 'inquirer-date-prompt';

import { LIB_TTY } from '../config';
import { InquirerPrompt } from '../decorators';
import {
  AcknowledgePrompt,
  CronPrompt,
  ListBuilderPrompt,
  MainMenuPrompt,
  ObjectBuilderPrompt,
  SelectLinePrompt,
  TimeoutPrompt,
} from '../inquirer';
import {
  BooleanEditorService,
  ChartingService,
  ColorsService,
  ComparisonToolsService,
  ConfigBuilderService,
  ConfirmEditorService,
  DateEditorService,
  DiscriminatorEditorService,
  EditorExplorerService,
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

inquirer.registerPrompt('objectBuilder', ObjectBuilderPrompt);
inquirer.registerPrompt('cron', CronPrompt);
inquirer.registerPrompt('selectLine', SelectLinePrompt);
inquirer.registerPrompt('timeout', TimeoutPrompt);
inquirer.registerPrompt('mainMenu', MainMenuPrompt);
inquirer.registerPrompt('acknowledge', AcknowledgePrompt);
inquirer.registerPrompt('listbuilder', ListBuilderPrompt);

// @ts-expect-error Probably related to missing ts defs or something
inquirer.registerPrompt('date', datePrompt);
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
    DiscriminatorEditorService,
    ComparisonToolsService,
    KeymapService,
    ConfigBuilderService,
    DateEditorService,
    EnumEditorService,
    EnvironmentService,
    EditorExplorerService,
    FooterEntryService,
    GitService,
    MainCLIService,
    NumberEditorService,
    PinnedItemService,
    PromptService,
    ReplExplorerService,
    StringEditorService,
    ConfirmEditorService,
    SystemService,
    TableService,
    TextRenderingService,
  ],
})
export class MainCLIModule {
  protected onPreInit(app: INestApplication): void {
    InquirerPrompt.forRoot(app);
  }
}
