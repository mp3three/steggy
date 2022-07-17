import { DiscoveryModule } from '@nestjs/core';
import { LibraryModule, RegisterCache } from '@steggy/boilerplate';

import {
  AcknowledgeComponentService,
  ConfirmComponentService,
  FooterEditorService,
  ListBuilderComponentService,
  MenuComponentService,
  TableBuilderComponentService,
} from '../components';
import {
  DEFAULT_HEADER_FONT,
  HEADER_COLOR,
  HELP,
  LIB_TTY,
  PAGE_SIZE,
  SECONDARY_HEADER_FONT,
} from '../config';
import {
  DateEditorService,
  NumberEditorService,
  PasswordEditorService,
  StringEditorService,
} from '../editors';
import {
  ApplicationManagerService,
  ChartingService,
  ColorsService,
  ComparisonToolsService,
  ComponentExplorerService,
  EditorExplorerService,
  EnvironmentService,
  FormService,
  GitService,
  KeyboardManagerService,
  KeymapService,
  LayoutManagerService,
  PromptService,
  ScreenService,
  StackService,
  SyncLoggerService,
  TableService,
  TerminalHelpService,
  TextRenderingService,
} from '../services';

@LibraryModule({
  configuration: {
    [DEFAULT_HEADER_FONT]: {
      default: 'ANSI Regular',
      description: 'Figlet font',
      type: 'string',
    },
    [HEADER_COLOR]: {
      default: 'bgBlue.black',
      description:
        'Color for primary header text + dividing line. Color must make sense to chalk',
      type: 'string',
    },
    [HELP]: {
      default: false,
      description:
        'Intended for consumption as cli switch (--help). Performs early abort and prints available cli switches to console',
      type: 'boolean',
    },
    [PAGE_SIZE]: {
      default: 20,
      description: 'Maximum number of items displayed in pickMany prompts',
      type: 'number',
    },
    [SECONDARY_HEADER_FONT]: {
      default: 'Pagga',
      description: 'Figlet font',
      type: 'string',
    },
  },
  exports: [
    ApplicationManagerService,
    ChartingService,
    ColorsService,
    ComparisonToolsService,
    EnvironmentService,
    GitService,
    KeymapService,
    LayoutManagerService,
    PromptService,
    ScreenService,
    StackService,
    SyncLoggerService,
    TableService,
    TextRenderingService,
  ],
  imports: [DiscoveryModule, RegisterCache()],
  library: LIB_TTY,
  providers: [
    AcknowledgeComponentService,
    ApplicationManagerService,
    ChartingService,
    ColorsService,
    ComparisonToolsService,
    ComponentExplorerService,
    ConfirmComponentService,
    DateEditorService,
    EditorExplorerService,
    EnvironmentService,
    FooterEditorService,
    FormService,
    GitService,
    KeyboardManagerService,
    KeymapService,
    LayoutManagerService,
    ListBuilderComponentService,
    MenuComponentService,
    NumberEditorService,
    PasswordEditorService,
    PromptService,
    ScreenService,
    StackService,
    StringEditorService,
    TerminalHelpService,
    SyncLoggerService,
    TableBuilderComponentService,
    TableService,
    TextRenderingService,
  ],
})
export class TTYModule {}
