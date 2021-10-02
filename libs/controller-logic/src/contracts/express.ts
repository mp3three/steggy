import { ResponseLocals } from '@automagical/server';
import { Response } from 'express';

import { RoomControllerSettingsDTO } from './dto';

type EmptyObject = Record<never, unknown>;

export class HomeControllerResponseLocals extends ResponseLocals {
  room?: string;
  roomSettings?: RoomControllerSettingsDTO;
}

export type HomeControllerResponse<BODY extends EmptyObject = EmptyObject> =
  Response<BODY, HomeControllerResponseLocals>;
