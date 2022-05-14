import { forwardRef, Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { VM } from 'vm2';

import { PersonService } from '../person.service';
import { RoomService } from '../room.service';
import { SecretsService } from '../secrets.service';

@Injectable()
export class VMService {
  constructor(
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    @Inject(forwardRef(() => PersonService))
    private readonly personService: PersonService,
    private readonly secretsService: SecretsService,
  ) {}

  public async exec<T>(
    code: string,
    parameters: Record<string, unknown> = {},
  ): Promise<T> {
    return await new VM({
      eval: false,
      fixAsync: true,
      sandbox: {
        dayjs,
        ...(await this.roomService.buildMetadata()),
        ...(await this.personService.buildMetadata()),
        ...(await this.secretsService.buildMetadata()),
        ...parameters,
      },
      timeout: 250,
      wasm: false,
    }).run(code);
  }
}
