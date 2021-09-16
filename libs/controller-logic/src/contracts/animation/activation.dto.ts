export class AnimationActivationDate {
  public hour: number;
  public minute: number;
  public type: 'time_of_day';
}
export class AnimationActivationMQTT {
  public topic: string;
  public type: 'mqtt';
}

export class AnimationActivationEvent {
  public topic: string;
  public type: 'event';
}
