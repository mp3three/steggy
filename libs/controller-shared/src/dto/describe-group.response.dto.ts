import { HassStateDTO } from '@steggy/home-assistant-shared';

export class DescribeGroupResponseDTO {
  room: string;
  states: HassStateDTO[];
}
