import { ACCESS_TYPES } from '@formio/contracts/formio-sdk';
import { ObjectID } from 'mongodb';
import { Column, Entity } from 'typeorm';

@Entity()
export class AccessEntity {
  // #region Object Properties

  @Column({ array: true })
  public resources: ObjectID[];
  @Column({
    enum: ACCESS_TYPES,
    type: 'enum',
  })
  public type: ACCESS_TYPES;

  // #endregion Object Properties
}
