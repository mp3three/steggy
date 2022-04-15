import {
  RoutineCommandStopProcessingDTO,
  STOP_PROCESSING_DEFINITIONS,
} from './stop-processing.dto';

export class RoutineEnableDTO<
  T = STOP_PROCESSING_DEFINITIONS,
> extends RoutineCommandStopProcessingDTO<T> {
  /**
   * Re-check interval for items such as webhook tests
   */
  public poll?: number;
  public type?: 'enable' | 'disable' | 'disable_rules' | 'enable_rules';
}
