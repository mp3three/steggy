import { Injectable } from '@nestjs/common';
import { PersonDTO, RoomDTO, RoomMetadataDTO } from '@steggy/controller-shared';
import { PromptService } from '@steggy/tty';

import { HomeFetchService } from './home-fetch.service';

@Injectable()
export class MetadataService<TYPE extends RoomDTO | PersonDTO> {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  public async setValue(
    target: TYPE,
    type: 'room' | 'person',
    property: string,
  ): Promise<TYPE> {
    const metadata = target.metadata.find(({ name, id }) =>
      [name, id].includes(property),
    );
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
          await this.promptService.pickOne(
            'Pick a value',
            metadata.options.map(line => ({ entry: [line, line] })),
            value as string,
          ),
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
  ): Promise<TYPE> {
    return await this.fetchService.fetch({
      body: { value },
      method: 'put',
      url: `/${type}/${target}/metadata/${id}`,
    });
  }
}
