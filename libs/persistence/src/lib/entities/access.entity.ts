import { ACCESS_TYPES } from '@automagical/contracts/formio-sdk';
import { ObjectID } from 'mongodb';
import { Column, Entity } from 'typeorm';

@Entity()
export class AccessEntity {
  // #region Object Properties

  @Column({ array: true })
  public resources: ObjectID[];
  @Column({
    type: 'enum',
    enum: ACCESS_TYPES,
  })
  public type: ACCESS_TYPES;

  // #endregion Object Properties
}
