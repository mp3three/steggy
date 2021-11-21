import { HassStateDTO } from '@ccontour/home-assistant';

export class DescribeGroupResponseDTO {
  room: string;
  states: HassStateDTO[];
}
