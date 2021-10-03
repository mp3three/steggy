import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { Document } from 'mongoose';

import { BaseRoomDTO } from './base-room.dto';

@Schema({
  collection: `room`,
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class RoomDTO extends BaseRoomDTO {
  @IsString({ each: true })
  @Expose()
  @Prop({ type: [String] })
  public fans?: string[];
  /**
   * Entities that can be controlled with the circadian lighting controller
   */
  @IsString({ each: true })
  @Expose()
  @Prop({ type: [String] })
  public lights?: string[];
  /**
   *  Primary lights for the room
   */
  @IsString({ each: true })
  @Expose()
  @Prop({ type: [String] })
  public switches?: string[];
}

export type RoomDocument = RoomDTO & Document;
export const RoomSchema = SchemaFactory.createForClass(RoomDTO);
