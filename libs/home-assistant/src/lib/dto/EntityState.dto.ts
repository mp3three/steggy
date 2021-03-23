// export type hassState = {
//   entity_id: string;
//   state: knownStates;
//   attributes: attributes;
//   last_changed: Date;
//   last_updated: Date;
//   context: {
//     id: string;
//     parent_id: string;
//     user_id: string;
//   };
// };

export class EntityStateDTO {
  // #region Object Properties

  public attributes: null;
  public entity_id: string;
  public state: null;

  // #endregion Object Properties
}
