export class AnimationActivationDate {
  // #region Object Properties

  public hour: number;
  public minute: number;
  public type: 'time_of_day';

  // #endregion Object Properties
}
export class AnimationActivationMQTT {
  // #region Object Properties

  public topic: string;
  public type: 'mqtt';

  // #endregion Object Properties
}

export class AnimationActivationEvent {
  // #region Object Properties

  public topic: string;
  public type: 'event';

  // #endregion Object Properties
}
