import { FanSpeeds, LOCK_STATES } from '@automagical/home-assistant';
import { BaseSchemaDTO } from '@automagical/persistence';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum, IsString } from 'class-validator';
import { Document } from 'mongoose';

export enum LIGHTING_MODE {
  circadian = 'circadian',
  on = 'on',
}
export class PersistenceSwitchStateDTO {
  @IsString()
  @Prop({ enum: ['on', 'off'], required: true, type: 'string' })
  state: 'on' | 'off';
}

export class PersistenceFanStateDTO extends PersistenceSwitchStateDTO {
  @IsEnum(FanSpeeds)
  @Prop({ enum: Object.values(FanSpeeds), type: 'string' })
  speed: FanSpeeds;
}

export class PersistenceLockStateDTO {
  @IsEnum(LOCK_STATES)
  @Prop({ enum: Object.values(LOCK_STATES), required: true, type: 'string' })
  state: LOCK_STATES;
}

export class PersistenceLightStateDTO extends PersistenceSwitchStateDTO {
  @Prop(Number)
  brightness?: number;
  @Prop([Number])
  hs_color?: [number, number] | number[];
  @Prop({
    default: LIGHTING_MODE.on,
    enum: Object.values(LIGHTING_MODE),
    required: true,
  })
  mode: LIGHTING_MODE;
}

export type BASE_STATES = PersistenceSwitchStateDTO | PersistenceLockStateDTO;

@Schema({
  collection: 'room_state',
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class RoomStateDTO<
  STATES extends BASE_STATES = PersistenceLightStateDTO,
> extends BaseSchemaDTO {
  @IsString({ each: true })
  @Prop()
  public entities: string[];
  @IsString()
  @Prop()
  public group?: string;
  @IsString()
  @Prop()
  public room: string;
  @Prop({ default: [], required: true })
  public states: STATES[];
}

export type RoomStateDocument = RoomStateDTO & Document;
export const RoomStateSchema = SchemaFactory.createForClass(RoomStateDTO);
RoomStateSchema.index({
  deleted: 1,
  group: 1,
  name: 1,
  room: 1,
});
