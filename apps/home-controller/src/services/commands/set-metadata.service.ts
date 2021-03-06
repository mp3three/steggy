import { forwardRef, Inject, NotImplementedException } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  ChronoService,
  iRoutineCommand,
  MathService,
  MetadataUpdate,
  PERSON_METADATA_UPDATED,
  PersonService,
  ROOM_METADATA_UPDATED,
  RoomService,
  RoutineCommand,
  VMService,
} from '@steggy/controller-sdk';
import {
  RoomDTO,
  RoomMetadataDTO,
  RoutineCommandDTO,
  SetRoomMetadataCommandDTO,
} from '@steggy/controller-shared';
import { HASocketAPIService } from '@steggy/home-assistant';
import { EMPTY, is, START } from '@steggy/utilities';
import { isNumberString } from 'class-validator';
import EventEmitter from 'eventemitter3';

type NumberTypes = 'set_value' | 'increment' | 'decrement' | 'formula' | 'eval';

@RoutineCommand({
  description: 'Update metadata for a person/room',
  name: 'Metadata Set',
  type: 'set_metadata',
})
export class SetMetadataService
  implements iRoutineCommand<SetRoomMetadataCommandDTO>
{
  constructor(
    private readonly logger: AutoLogService,
    private readonly eventEmitter: EventEmitter,
    @Inject(forwardRef(() => RoomService))
    private readonly room: RoomService,
    @Inject(forwardRef(() => PersonService))
    private readonly person: PersonService,
    private readonly chrono: ChronoService,
    private readonly socket: HASocketAPIService,
    @Inject(forwardRef(() => VMService))
    private readonly vm: VMService,
    private readonly math: MathService,
  ) {}

  public async activate({
    command,
    runId,
  }: {
    command: RoutineCommandDTO<SetRoomMetadataCommandDTO>;
    runId: string;
  }): Promise<void> {
    const room =
      command.command.type === 'person'
        ? await this.person.getWithStates(command.command.room)
        : await this.room.getWithStates(command.command.room);
    room.metadata ??= [];
    const entry = room.metadata.find(
      ({ name }) => name === command.command.name,
    );
    if (!entry) {
      this.logger.error(
        `[${room.friendlyName}] cannot set {${command.command.name}}, property does not exist`,
      );
      return;
    }
    entry.value = await this.getValue(command.command, room, entry, runId);
    await (command.command.type === 'person'
      ? this.person.update({ metadata: room.metadata }, room._id)
      : this.room.update({ metadata: room.metadata }, room._id));
    this.logger.debug(`${room.friendlyName}#${entry.name} = ${entry.value}`);
    this.eventEmitter.emit(
      command.command.type === 'person'
        ? PERSON_METADATA_UPDATED
        : ROOM_METADATA_UPDATED,
      {
        name: entry.name,
        room: room._id,
        value: entry.value,
      } as MetadataUpdate,
    );
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
      // Opting to be extra safe here
      return metadata.options[START];
    }
    return command.value;
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private async getNumberValue(
    command: SetRoomMetadataCommandDTO,
    room: RoomDTO,
    metadata: RoomMetadataDTO,
  ): Promise<number> {
    const valueType = (command.valueType ?? 'set_value') as NumberTypes;
    let setValue = command.value;
    if (valueType === 'formula') {
      if (!is.string(setValue)) {
        this.logger.error(
          { formula: setValue },
          `Math formula is not a string`,
        );
        return EMPTY;
      }
      try {
        return await this.math.exec(setValue);
      } catch (error) {
        this.logger.error({ error });
        return EMPTY;
      }
    }
    if (!is.number(setValue)) {
      setValue = isNumberString(setValue) ? Number(setValue) : EMPTY;
    }
    let currentValue = metadata.value;
    if (!is.number(currentValue)) {
      this.logger.warn(
        { currentValue },
        `Current value is not a number, resetting to 0`,
      );
      currentValue = EMPTY;
    }
    if (valueType === 'set_value') {
      return setValue;
    }
    if (valueType === 'decrement') {
      return currentValue - setValue;
    }
    if (valueType === 'increment') {
      return currentValue + setValue;
    }
    throw new NotImplementedException(
      `Unknown number operation type: ${valueType}`,
    );
  }

  private async getStringValue(
    command: SetRoomMetadataCommandDTO,
  ): Promise<string> {
    if (!is.string(command.value)) {
      // ????
      this.logger.error({ command }, `Value is not string`);
      return ``;
    }
    const type = command.valueType ?? 'simple';
    if (type === 'template') {
      return await this.socket.renderTemplate(command.value);
    }
    return command.value;
  }

  private async getValue(
    command: SetRoomMetadataCommandDTO,
    room: RoomDTO,
    metadata: RoomMetadataDTO,
    runId: string,
  ): Promise<string | number | boolean> {
    if (command.valueType === 'eval') {
      return await this.vm.fetch((command.value as string) || '', {
        runId,
      });
    }
    if (metadata.type === 'boolean') {
      if (is.boolean(command.value)) {
        return command.value;
      }
      // Just assume toggle
      return !metadata.value;
    }
    if (metadata.type === 'string') {
      return await this.getStringValue(command);
    }
    if (metadata.type === 'enum') {
      return this.getEnumValue(command, metadata);
    }
    if (metadata.type === 'date') {
      const [start] = this.chrono.parse(String(command.value));
      return (start as Date).toISOString();
    }
    if (metadata.type === 'number') {
      return await this.getNumberValue(command, room, metadata);
    }
    throw new NotImplementedException(`Bad metadata type: ${metadata.type}`);
  }
}
