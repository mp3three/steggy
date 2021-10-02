import { HassStateDTO } from '@automagical/home-assistant';

export class DescribeGroupResponseDTO {
  room: string;
  states: HassStateDTO[];
}
