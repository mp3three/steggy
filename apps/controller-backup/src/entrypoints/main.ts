import { Type } from '@nestjs/common';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';
import { InjectConfig, QuickScript, SERIALIZE } from '@steggy/boilerplate';
import {
  CodePersistenceService,
  GroupPersistenceService,
  MetadataPersistenceService,
  PersonPersistenceService,
  RoomPersistenceService,
  RoutinePersistenceService,
} from '@steggy/controller-sdk';
import {
  CodeDTO,
  GroupDTO,
  MetadataDTO,
  PersonDTO,
  RoomDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import {
  BaseMongoService,
  BaseSchemaDTO,
  ConnectService,
  LIB_PERSISTENCE,
  MONGO_URI,
  MongoPersistenceModule,
} from '@steggy/persistence';
import {
  ansiEscapes,
  ApplicationManagerService,
  PromptService,
  ScreenService,
  SyncLoggerService,
  TextRenderingService,
  TTYModule,
} from '@steggy/tty';
import { eachSeries, is, TitleCase } from '@steggy/utilities';
import { eachLimit } from 'async';
import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { exit } from 'process';

import { BackupHeader } from '../types';

const { unserialize, serialize } = SERIALIZE;
const ALL_COLLECTIONS = new Set([
  'code',
  'group',
  'metadata',
  'room',
  'person',
  'routine',
]);

@QuickScript({
  application: Symbol('controller-backup'),
  imports: [
    MongooseModule.forRootAsync({
      imports: [MongoPersistenceModule],
      inject: [ConnectService],
      useFactory: async (connect: ConnectService) => await connect.build(),
    }),
    MongoPersistenceModule,
    MongooseModule.forFeature(
      [CodeDTO, GroupDTO, MetadataDTO, PersonDTO, RoomDTO, RoutineDTO].map(
        (i: Type) => ({
          name: i.name,
          schema: SchemaFactory.createForClass(i),
        }),
      ),
    ),
    TTYModule,
  ],
  providers: [
    // Big brain idea: Stealing providers from other modules
    // It works 🤷
    CodePersistenceService,
    GroupPersistenceService,
    MetadataPersistenceService,
    PersonPersistenceService,
    RoomPersistenceService,
    RoutinePersistenceService,
  ],
})
export class ControllerBackup {
  constructor(
    private readonly logger: SyncLoggerService,
    private readonly terminal: ApplicationManagerService,
    private readonly code: CodePersistenceService,
    private readonly group: GroupPersistenceService,
    private readonly metadata: MetadataPersistenceService,
    @InjectConfig(MONGO_URI, LIB_PERSISTENCE) private readonly mongoUri: string,
    private readonly person: PersonPersistenceService,
    private readonly prompt: PromptService,
    private readonly room: RoomPersistenceService,
    private readonly routine: RoutinePersistenceService,
    @InjectConfig('RESTORE_FROM', {
      description: 'Path to file containing backup',
      type: 'string',
    })
    private readonly restore: string,
    @InjectConfig('RESTORE_SPEED', {
      default: 100,
      description: 'Path to file containing backup',
      type: 'number',
    })
    private readonly restoreSpeed: number,
    private readonly screen: ScreenService,
    private readonly text: TextRenderingService,
  ) {}

  public async exec(): Promise<void> {
    this.terminal.setHeader('Restoring from file');
    if (!existsSync(this.restore)) {
      this.logger.error(`File does not exist {${this.restore}}`);
      return;
    }
    const [headerText, ...other] = readFileSync(this.restore, 'utf8')
      .trim()
      .split(`\n`);
    const header = unserialize(headerText, BackupHeader);
    const action = await this.prompt.menu({
      headerMessage: [
        ['Backup created on', this.text.type(new Date(header.timestamp))],
        [
          'Restore target',
          ansiEscapes.link(this.text.type(this.mongoUri), this.mongoUri),
        ],
      ],
      keyMap: {
        a: [chalk.green.dim`restore all`, 'all'],
        d: [`done`, 'done'],
      },
      right: header.contents.map(({ collection, count }) => ({
        entry: [TitleCase(collection), collection],
        helpText: `${this.text.type(count)} items`,
      })),
      rightHeader: 'Restore single item',
      showHeaders: true,
    });
    if (action === 'done') {
      return;
    }
    const data = unserialize<Record<string, BaseSchemaDTO[]>>(other.join(`\n`));
    if (ALL_COLLECTIONS.has(action)) {
      if (is.undefined(data[action])) {
        this.logger.fatal(`{${action}} not included in data payload`);
        return;
      }
      await this.restoreCollection(action, data[action]);
      return;
    }
    if (action === 'all') {
      await eachSeries(
        ALL_COLLECTIONS,
        async (item: keyof typeof data) =>
          await this.restoreCollection(item, data[item]),
      );
      return;
    }
    this.logger.error(`Unknown action {${action}}`);
  }

  /**
   * If this isn't a restore, then assume it's a backup request.
   */
  protected async onPreInit(): Promise<void> {
    if (!is.empty(this.restore)) {
      return;
    }
    const raw = {
      code: await this.code.findMany({ select: [] }),
      group: await this.group.findMany({ select: [] }),
      metadata: await this.metadata.findMany({ select: [] }),
      person: await this.person.findMany({ select: [] }),
      room: await this.room.findMany({ select: [] }),
      routine: await this.routine.findMany({ select: [] }),
    };
    // Header line
    this.screen.printLine(
      serialize({
        contents: Object.entries(raw).map(([i, values]) => ({
          collection: i,
          count: values.length,
        })),
        timestamp: Date.now(),
      } as BackupHeader),
    );
    // Full body
    this.screen.printLine(serialize(raw));
    exit();
  }

  private getDriver(collection: string): BaseMongoService {
    return {
      code: this.code,
      group: this.group,
      metadata: this.metadata,
      person: this.person,
      room: this.room,
      routine: this.routine,
    }[collection];
  }

  private async restoreCollection(
    collection: string,
    items: BaseSchemaDTO[],
  ): Promise<void> {
    const driver = this.getDriver(collection);
    if (is.undefined(driver)) {
      return;
    }
    this.logger.warn(`Truncate {${collection}}`);
    await driver.truncate();
    this.logger.info(`[${collection}] inserting {${items.length}} documents`);
    await eachLimit(items, this.restoreSpeed, async item => {
      await driver.restore(item);
      this.screen.print('.');
    });
    this.screen.printLine();
    this.logger.info(`Done!`);
  }
}
