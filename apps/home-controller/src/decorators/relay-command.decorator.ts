import { applyDecorators } from '@nestjs/common';
import {
  iRoomControllerMethods,
  ROOM_COMMAND,
} from '@text-based/controller-logic';
import { EmitAfter } from '@text-based/utilities';

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
