import { forwardRef, Inject, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import moment from 'moment';
import { VM } from 'vm2';

import { RoomService } from './room.service';

@Injectable()
export class VMService {
  constructor(
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
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
        moment,
        ...(await this.roomService.buildMetadata()),
        ...parameters,
      },
      timeout: 250,
      wasm: false,
    }).run(code);
  }
}
