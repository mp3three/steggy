import { Schema } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import { ObjectID } from 'mongodb';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

import { AccessEntity } from './access.entity';

/**
 * POC work, do not use
 *
 * Refer to SubmissionDTO for real work
 */
@Entity()
@Schema()
export class SubmissionEntity {
  // #region Object Properties

  @Column({ array: true, nullable: false })
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
