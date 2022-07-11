/* eslint-disable no-console */
import { Type } from '@nestjs/common';
import { MongooseModule, SchemaFactory } from '@nestjs/mongoose';
import { InjectConfig, QuickScript } from '@steggy/boilerplate';
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
import { ConnectService, MongoPersistenceModule } from '@steggy/persistence';
import {
  ApplicationManagerService,
  PromptService,
  ScreenService,
  TextRenderingService,
  TTYModule,
} from '@steggy/tty';
import { INCREMENT, TitleCase } from '@steggy/utilities';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { gunzipSync, gzipSync } from 'zlib';

import { BackupHeader } from '../types';

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
    private readonly terminal: ApplicationManagerService,
    private readonly code: CodePersistenceService,
    private readonly group: GroupPersistenceService,
    private readonly metadata: MetadataPersistenceService,
    private readonly person: PersonPersistenceService,
    private readonly prompt: PromptService,
    private readonly room: RoomPersistenceService,
    private readonly routine: RoutinePersistenceService,
    @InjectConfig('RESTORE_FROM', {
      default: './backup',
      description: 'Path to file containing backup',
      type: 'string',
    })
    private readonly restore: string,
    private readonly screen: ScreenService,
    private readonly textRendering: TextRenderingService,
  ) {}

  public async exec(): Promise<void> {
    if (this.restore) {
      this.performRestore();
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
    const data = await this.serialize(raw);
    const headerText = await this.serialize({
      contents: Object.entries(raw).map(([i, values]) => [i, values.length]),
      timestamp: Date.now(),
    } as BackupHeader);
    console.log(headerText);
    console.log(data);
  }

  private async performRestore(): Promise<void> {
    this.terminal.setHeader('Restoring from file');
    const [headerText, ...other] = readFileSync(this.restore, 'utf8')
      .trim()
      .split(`\n`);
    const header = this.unserialize<BackupHeader>(headerText);
    const action = await this.prompt.menu({
      right: header.contents.map(([label, count]) => ({
        entry: [TitleCase(label), label],
        helpText: `${this.textRendering.typePrinter(count)} items`,
      })),
    });
    other.join(`\n`);
  }

  /**
   * My local testing had:
   *
   * - json size: 140559 characters
   * - base64 size: 36616 characters
   *
   * almost 75% reduction!
   */
  private serialize(data: unknown): string {
    const buffer = Buffer.from(JSON.stringify(data), 'utf8');
    return gzipSync(buffer).toString('base64');
  }

  private unserialize<T>(data: string): T {
    const buffer = gunzipSync(Buffer.from(data, 'base64'));
    return JSON.parse(buffer.toString());
  }
}
