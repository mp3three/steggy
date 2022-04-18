import { DiscoveryModule } from '@nestjs/core';
import { LibraryModule, RegisterCache } from '@steggy/boilerplate';

import {
  BACKGROUND_MENU,
  BORDER_COLOR_ACTIVE,
  BORDER_COLOR_ERROR,
  BORDER_COLOR_INACTIVE,
  BORDER_COLOR_WARN,
  DEFAULT_HEADER_FONT,
  HEADER_COLOR,
  LIB_TTY,
  PAGE_SIZE,
  PINNED_ITEMS,
  SECONDARY_HEADER_FONT,
  TEXT_DETAILS,
  TEXT_HELP,
  TEXT_IMPORTANT,
  TEXT_INFO,
} from '../config';
import {
  AcknowledgeComponentService,
  ApplicationManagerService,
  BooleanEditorService,
  ChartingService,
  ColorsService,
  ComparisonToolsService,
  ComponentExplorerService,
  ConfigBuilderService,
  ConfirmEditorService,
  DateEditorService,
  DiscriminatorEditorService,
  EditorExplorerService,
  EnumEditorService,
  EnvironmentService,
  FooterEditorService,
  GitService,
  KeyboardManagerService,
  KeymapService,
  LayoutManagerService,
  ListBuilderComponentService,
  MainCLIService,
  MenuComponentService,
  NumberEditorService,
  PinnedItemService,
  PromptService,
  ReplExplorerService,
  ScreenService,
  StackService,
  StringEditorService,
  SystemService,
  TableBuilderComponentService,
  TableService,
  TextRenderingService,
  ThemeService,
} from '../services';

@LibraryModule({
  configuration: {
    [BACKGROUND_MENU]: {
      default: '6B7F82',
      description: '',
      type: 'string',
    },
    [BORDER_COLOR_ACTIVE]: {
      default: '607D8B',
      description: '',
      type: 'string',
    },
    [BORDER_COLOR_ERROR]: {
      default: 'DD2C00',
      description: '',
      type: 'string',
    },
    [BORDER_COLOR_INACTIVE]: {
      default: '263238',
      description: '',
      type: 'string',
    },
    [BORDER_COLOR_WARN]: {
      default: 'FFAB00',
      description: '',
      type: 'string',
    },
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
    [PAGE_SIZE]: {
      default: 20,
      description: 'Maximum number of items displayed in pickMany prompts',
      type: 'number',
    },
    [PINNED_ITEMS]: {
      configurable: false,
      default: [],
      description:
        'Stick some callbacks at the top of main cli. Managed from application',
      type: 'internal',
    },
    [SECONDARY_HEADER_FONT]: {
      default: 'Pagga',
      description: 'Figlet font',
      type: 'string',
    },
    [TEXT_DETAILS]: {
      default: 'A1E44D',
      description: '',
      type: 'string',
    },
    [TEXT_HELP]: {
      default: 'FF9100',
      description: '',
      type: 'string',
    },
    [TEXT_IMPORTANT]: {
      default: '1DE9B6',
      description: '',
      type: 'string',
    },
    [TEXT_INFO]: {
      default: '00B0FF',
      description: '',
      type: 'string',
    },
  },
  exports: [
    ApplicationManagerService,
    ChartingService,
    ColorsService,
    ComparisonToolsService,
    ConfigBuilderService,
    EnvironmentService,
    LayoutManagerService,
    GitService,
    KeymapService,
    PinnedItemService,
    PromptService,
    ScreenService,
    StackService,
    SystemService,
    TableService,
    TextRenderingService,
  ],
  imports: [DiscoveryModule, RegisterCache()],
  library: LIB_TTY,
  providers: [
    AcknowledgeComponentService,
    ApplicationManagerService,
    BooleanEditorService,
    ChartingService,
    ColorsService,
    ComparisonToolsService,
    ComponentExplorerService,
    ConfigBuilderService,
    ConfirmEditorService,
    DateEditorService,
    DiscriminatorEditorService,
    EditorExplorerService,
    EnumEditorService,
    EnvironmentService,
    FooterEditorService,
    GitService,
    KeyboardManagerService,
    KeymapService,
    LayoutManagerService,
    ListBuilderComponentService,
    MainCLIService,
    MenuComponentService,
    NumberEditorService,
    PinnedItemService,
    PromptService,
    ReplExplorerService,
    ScreenService,
    StackService,
    StringEditorService,
    SystemService,
    TableBuilderComponentService,
    TableService,
    TextRenderingService,
    ThemeService,
  ],
})
export class MainCLIModule {}
