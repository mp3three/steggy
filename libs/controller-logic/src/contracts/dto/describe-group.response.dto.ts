import { HassStateDTO } from '@for-science/home-assistant';

export class DescribeGroupResponseDTO {
  room: string;
  states: HassStateDTO[];
}
