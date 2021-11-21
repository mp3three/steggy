import {
  iRoomControllerMethods,
  ROOM_COMMAND,
} from '@ccontour/controller-logic';
import { EmitAfter } from '@ccontour/utilities';
import { applyDecorators } from '@nestjs/common';

export function RelayCommand(
  rooms: string[] | '*',
  state: keyof iRoomControllerMethods,
): MethodDecorator {
  return function (target, key, descriptor) {
    if (rooms === '*') {
      return applyDecorators(
        EmitAfter(ROOM_COMMAND('*', state), {
          emitData: 'parameters',
          onlyTruthyResults: true,
        }),
      )(target, key, descriptor);
    }
    const decorators = rooms.map((room) => {
      return EmitAfter(ROOM_COMMAND(room, state), {
        emitData: 'parameters',
        onlyTruthyResults: true,
      });
    });
    return applyDecorators(...decorators)(target, key, descriptor);
  };
}
