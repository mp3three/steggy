import { Injectable } from '@nestjs/common';
import {
  DeviceListItemDTO,
  HASSIO_WS_COMMAND,
  RelatedDescriptionDTO,
} from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';

import { HASocketAPIService } from './ha-socket-api.service';

@Injectable()
export class DeviceService {
  constructor(private readonly socket: HASocketAPIService) {}

  public async findRelated(
    device: DeviceListItemDTO | string,
  ): Promise<RelatedDescriptionDTO> {
    device = is.string(device) ? device : device.id;
    return await this.socket.sendMessage<RelatedDescriptionDTO>({
      item_id: device,
      item_type: 'device',
      type: HASSIO_WS_COMMAND.search_related,
    });
  }

  public async list(): Promise<DeviceListItemDTO[]> {
    return await this.socket.sendMessage({
      type: HASSIO_WS_COMMAND.device_list,
    });
  }
}
