import { LightingCacheDTO } from './dto';

export class RoutineCaptureEntity {
  public attributes?: Record<string, unknown>;
  public entity_id: string;
  public state?: unknown;
}

export class RoutineCaptureData {
  public lightCache: Record<string, LightingCacheDTO>;
  public states: RoutineCaptureEntity[];
}

export const IGNORED_ATTRIBUTES = ['friendly_name'];
