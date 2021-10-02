import { BaseSchemaDTO } from '@automagical/persistence';
import { Prop, Schema } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';

import { BaseRoomDTO } from './base-room.dto';

@Schema({
  collection: `room`,
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
