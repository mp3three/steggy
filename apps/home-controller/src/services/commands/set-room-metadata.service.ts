import { AutoLogService } from '@automagical/boilerplate';
import {
  RoomDTO,
  RoomMetadataDTO,
  SetRoomMetadataCommandDTO,
} from '@automagical/controller-shared';
import { EMPTY, is, START } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { parse } from 'chrono-node';
import EventEmitter from 'eventemitter3';
import { parse as MathParse } from 'mathjs';

import { MetadataUpdate, ROOM_METADATA_UPDATED } from '../../typings';
import { RoomService } from '../room.service';

type NumberTypes = 'set_value' | 'increment' | 'decrement' | 'formula';

@Injectable()
export class SetRoomMetadataService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly eventEmitter: EventEmitter,
    private readonly roomService: RoomService,
  ) {}

  public async activate(command: SetRoomMetadataCommandDTO): Promise<void> {
    const room = await this.roomService.get(command.room);
    room.metadata ??= [];
    const entry = room.metadata.find(({ name }) => name === command.name);
    if (!entry) {
      this.logger.error(
        `[${room.friendlyName}] cannot set {${command.name}}, property does not exist`,
      );
      return;
    }
    entry.value = this.getValue(command, room, entry);
    await this.roomService.update({ metadata: room.metadata }, room._id);
    this.logger.debug(`${room.friendlyName}#${entry.name} = ${entry.value}`);
    this.eventEmitter.emit(ROOM_METADATA_UPDATED, {
      name: entry.name,
      room: room._id,
      value: entry.value,
    } as MetadataUpdate);
  }

  private getEnumValue(
    command: SetRoomMetadataCommandDTO,
    metadata: RoomMetadataDTO,
  ) {
    if (is.empty(metadata.options)) {
      this.logger.error({ metadata }, `Enum metadata does not contain options`);
      return ``;
    }
    if (!metadata.options.includes(command.value as string)) {
      // This really should have been caught by class-validator
      // Probably some weird ui inconsistency
      this.logger.error(
        { options: metadata.options, value: command.value },
        `Value not contained in list of enum options`,
      );
      return metadata.options[START];
    }
    return command.value;
  }

  private getNumberValue(
    command: SetRoomMetadataCommandDTO,
    room: RoomDTO,
    metadata: RoomMetadataDTO,
  ): number {
    const valueType = (command.type ?? 'set_value') as NumberTypes;
    if (valueType === 'set_value') {
      return command.value as number;
    }
    if (valueType === 'decrement') {
      return Number(metadata.value) - Number(command.value);
    }
    if (valueType === 'increment') {
      return Number(metadata.value) + Number(command.value);
    }
    if (valueType === 'formula') {
      try {
        const node = MathParse(metadata.value as string);
        if (!node) {
          return EMPTY;
        }
        return node.evaluate(
          Object.fromEntries(
            room.metadata
              .filter(({ type }) => type === 'number')
              .map(({ name, value }) => [name, value as number]),
          ),
        );
      } catch (error) {
        this.logger.error({ error });
        return EMPTY;
      }
    }
    throw new NotImplementedException();
  }

  private getValue(
    command: SetRoomMetadataCommandDTO,
    room: RoomDTO,
    metadata: RoomMetadataDTO,
  ): string | number | boolean {
    if (metadata.type === 'boolean') {
      if (is.boolean(command.value)) {
        return command.value;
      }
      // Just assume toggle
      return !metadata.value;
    }
    if (metadata.type === 'string') {
      if (!is.string(command.value)) {
        this.logger.error({ command }, `Value is not string`);
        // 🤷
        return String(command.value);
      }
      return command.value;
    }
    if (metadata.type === 'enum') {
      return this.getEnumValue(command, metadata);
    }
    if (metadata.type === 'date') {
      const [parsed] = parse(String(command.value));
      if (!parsed) {
        this.logger.error(
          { expression: command.value },
          `Expression failed parsing`,
        );
        // 🤷
        return new Date().toISOString();
      }
      return parsed.start.date().toISOString();
    }
    if (metadata.type === 'number') {
      return this.getNumberValue(command, room, metadata);
    }
    throw new NotImplementedException(`Bad metadata type: ${metadata.type}`);
  }
}
