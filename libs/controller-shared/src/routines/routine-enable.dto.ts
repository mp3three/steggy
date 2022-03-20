import { RoutineCommandStopProcessingDTO } from './stop-processing.dto';

export class RoutineEnableDTO extends RoutineCommandStopProcessingDTO {
  /**
   * Re-check interval for items such as webhook tests
   */
  public poll?: number;
  public type?: 'enable' | 'disable' | 'disable_rules' | 'enable_rules';
}
