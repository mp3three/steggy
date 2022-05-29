import { Injectable } from '@nestjs/common';
import { PersonDTO, RoomDTO, RoomMetadataDTO } from '@steggy/controller-shared';
import { PromptService } from '@steggy/tty';

import { HomeFetchService } from './home-fetch.service';
import { PersonCommandService } from './people';
import { RoomCommandService } from './rooms';

@Injectable()
export class MetadataService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly roomService: RoomCommandService,
    private readonly personService: PersonCommandService,
  ) {}

  public async setValue(
    target: RoomDTO | PersonDTO,
    type: 'room' | 'person',
    property: string,
  ): Promise<void> {
    const metadata = target.metadata.find(({ name }) => name === property);
    const value = metadata.value;
    switch (metadata.type) {
      case 'date':
        return await this.sendUpdate(
          type,
          target._id,
          metadata.id,
          await this.promptDate(metadata, value as string),
        );
      case 'boolean':
        return await this.sendUpdate(
          type,
          target._id,
          metadata.id,
          await this.promptService.boolean(metadata.name, value as boolean),
        );
      case 'enum':
        return await this.sendUpdate(
          type,
          target._id,
          metadata.id,
          await this.promptService.menu({
            right: metadata.options.map(line => ({ entry: [line, line] })),
            value: value as string,
          }),
        );
      case 'number':
        return await this.sendUpdate(
          type,
          target._id,
          metadata.id,
          await this.promptService.number(metadata.name, value as number),
        );
      case 'string':
        return await this.sendUpdate(
          type,
          target._id,
          metadata.id,
          await this.promptService.string(metadata.name, value as string),
        );
    }
  }

  private async promptDate(metadata: RoomMetadataDTO, value: string) {
    const out = await this.promptService.date({
      current: value as string,
      label: `Set ${metadata.name}`,
    });
    return out.toISOString();
  }

  private async sendUpdate(
    type: 'room' | 'person',
    target: string,
    id: string,
    value: string | number | boolean,
  ): Promise<void> {
    await this.fetchService.fetch({
      body: { value },
      method: 'put',
      url: `/${type}/${target}/metadata/${id}`,
    });
  }
}
