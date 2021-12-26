import { HassStateDTO } from '@text-based/home-assistant';

export class DescribeGroupResponseDTO {
  room: string;
  states: HassStateDTO[];
}
