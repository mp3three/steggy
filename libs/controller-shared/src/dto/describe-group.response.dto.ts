import { HassStateDTO } from '@text-based/home-assistant-shared';

export class DescribeGroupResponseDTO {
  room: string;
  states: HassStateDTO[];
}
