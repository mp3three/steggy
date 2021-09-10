import { EdgeJobResponseDTO } from './job.response.dto';
import { StackStatusResponseDTO } from './stack-status.response.dto';

export class EndpointStatusInspectResponseDTO {
  public checkin: number;
  public credentials: string;
  public port: number;
  public schedules: EdgeJobResponseDTO[];
  public stacks: StackStatusResponseDTO[];
  public status: string;
}
