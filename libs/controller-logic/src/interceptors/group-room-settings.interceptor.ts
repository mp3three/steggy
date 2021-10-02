import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { HomeControllerResponse } from '../contracts';
import { RoomManagerService } from '../services';

@Injectable()
export class GroupRoomInterceptor implements NestInterceptor {
  constructor(private readonly roomManager: RoomManagerService) {}
  public intercept<T>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const { locals } = context
      .switchToHttp()
      .getResponse<HomeControllerResponse>();
    if (!locals.parameters.has('group')) {
      throw new InternalServerErrorException(`Missing group parameter`);
    }
    const groupName = locals.parameters.get('group');
    const found = [...this.roomManager.settings.entries()].find(
      ([, settings]) => {
        return settings.name === groupName;
      },
    );
    if (!found) {
      throw new BadRequestException(`Bad group name ${groupName}`);
    }
    const [name, settings] = found;
    locals.room = name;
    locals.roomSettings = settings;
    return next.handle();
  }
}
