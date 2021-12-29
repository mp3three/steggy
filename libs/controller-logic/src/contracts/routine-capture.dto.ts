export class RoutineCaptureEntity {
  public attributes?: Record<string, unknown>;
  public entity_id: string;
  public state?: unknown;
}

export class RoutineCaptureData {
  public states: RoutineCaptureEntity[];
}
