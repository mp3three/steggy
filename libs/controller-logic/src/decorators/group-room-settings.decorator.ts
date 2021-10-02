import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import {
  HomeControllerResponse,
  RoomControllerSettingsDTO,
} from '../contracts';

export const GroupRoomSettings = createParamDecorator(
  (
    data: RoomControllerSettingsDTO,
    context: ExecutionContext,
  ): RoomControllerSettingsDTO => {
    const response = context
      .switchToHttp()
      .getResponse<HomeControllerResponse>();
    return data ?? response.locals.roomSettings;
  },
);
export const GroupRoom = createParamDecorator(
  (data: string, context: ExecutionContext): string => {
    const response = context
      .switchToHttp()
      .getResponse<HomeControllerResponse>();
    return data ?? response.locals.room;
  },
);
