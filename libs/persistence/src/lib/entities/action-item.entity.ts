import { ACTION_STATES } from '@automagical/contracts/formio-sdk';
import { IsNotEmpty } from '@automagical/validation';
import { ObjectID } from 'mongodb';
import { Column, DeleteDateColumn, Entity, Index } from 'typeorm';

@Entity('ActionItem')
export class ActionItem {
  // #region Object Properties

  @Column({
    default: ACTION_STATES.new,
    enum: ACTION_STATES,
    type: 'enum',
  })
  public state: ACTION_STATES;
  @Column({ nullable: false })
  @IsNotEmpty()
  public action: string;
  @Column({ nullable: false })
  @IsNotEmpty()
  public handler: string;
  @Column({ array: true })
  @IsNotEmpty()
  public messages: string[];
  @Column({ nullable: false })
  @IsNotEmpty()
  public method: string;
  @Index()
  @Column()
  public submission: ObjectID;
  @Index()
  @Column({ nullable: false })
  @IsNotEmpty()
  public form: string;
  @Index()
  @Column({ nullable: false })
  @IsNotEmpty()
  public project: ObjectID;
  @Index()
  @Column({ length: 63, nullable: false })
  @IsNotEmpty()
  public title: string;
  @Index()
  @DeleteDateColumn()
  public deleted: Date;

  public data: Record<string, unknown>;

  // #endregion Object Properties
  // submission,
}
