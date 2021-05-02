import { ActionItemDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActionItemDocument = ActionItemDTO & Document;

export const ActionItemSchema = SchemaFactory.createForClass(ActionItemDTO);
ActionItemSchema.index({
  deleted: 1,
  modified: -1,
  project: 1,
  state: 1,
})
  .index({
    deleted: 1,
    handler: 1,
    modified: -1,
    project: 1,
  })
  .index({
    deleted: 1,
    handler: 1,
    method: 1,
    modified: -1,
    project: 1,
  })
  .index({ created: 1 }, { expireAfterSeconds: 2592000 });
