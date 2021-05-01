import { IsNotEmpty } from '@automagical/validation';
import { ObjectID } from 'mongodb';
import { Schema } from '@nestjs/mongoose';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { AccessEntity } from './access.entity';

@Entity()
@Schema()
export class SubmissionEntity {
  // #region Object Properties

  @Column({ nullable: false, array: true })
  @IsNotEmpty()
  @Index()
  public roles: ObjectID[];
  @Index()
  @Column({ nullable: false })
  @IsNotEmpty()
  public form!: string;
  @Index()
  @DeleteDateColumn()
  public deleted: Date;
  @JoinTable()
  public owner: SubmissionEntity;
  @PrimaryGeneratedColumn()
  @IsNotEmpty()
  public _id!: ObjectID;
  @RelationId(() => AccessEntity)
  public access: AccessEntity[];

  public data: ObjectID;
  public externalIds: null;
  public metadata: null;

  // #endregion Object Properties
}
