import { BaseSchemaDTO } from '@automagical/persistence';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsString } from 'class-validator';
import { Document } from 'mongoose';

export enum LIGHTING_MODE {
  circadian = 'circadian',
  on = 'on',
}
export class PersistenceSwitchStateDTO {
  @Prop({ required: true, type: String })
  entity_id: string;
  @Prop({ enum: ['on', 'off'], required: true, type: String })
  state: 'on' | 'off';
}

export class PersistenceLightStateDTO extends PersistenceSwitchStateDTO {
  @Prop(Number)
  brightness?: number;
  @Prop([Number])
  hs?: [number, number] | number[];
  @Prop({
    default: LIGHTING_MODE.on,
    enum: Object.values(LIGHTING_MODE),
    required: true,
  })
  mode: LIGHTING_MODE;
}

@Schema({
  collection: 'room_state',
  timestamps: {
    createdAt: 'created',
    updatedAt: 'modified',
  },
})
export class RoomStateDTO<
  STATES extends PersistenceSwitchStateDTO = PersistenceLightStateDTO,
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
