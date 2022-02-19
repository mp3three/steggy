import { HassStateDTO } from '@automagical/home-assistant-shared';

export class DescribeGroupResponseDTO {
  room: string;
  states: HassStateDTO[];
}
