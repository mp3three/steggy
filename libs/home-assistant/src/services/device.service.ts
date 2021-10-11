import { AutoLogService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import {
  DeviceListItemDTO,
  HASSIO_WS_COMMAND,
  RelatedDescriptionDTO,
} from '../contracts';
import { EntityManagerService } from './entity-manager.service';
import { HASocketAPIService } from './ha-socket-api.service';

@Injectable()
export class DeviceService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly socketService: HASocketAPIService,
    private readonly entityManager: EntityManagerService,
  ) {}

  @Trace()
  public async findRelated(
    device: DeviceListItemDTO | string,
  ): Promise<RelatedDescriptionDTO> {
    device = typeof device === 'string' ? device : device.id;
    return await this.socketService.sendMsg<RelatedDescriptionDTO>({
      item_id: device,
      item_type: 'device',
      type: HASSIO_WS_COMMAND.search_related,
    });
  }

  @Trace()
  public async list(): Promise<DeviceListItemDTO[]> {
    return await this.socketService.sendMsg({
      type: HASSIO_WS_COMMAND.device_list,
    });
  }
}