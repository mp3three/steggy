import { FormDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FormDocument = FormDTO & Document;

export const FormDocument = SchemaFactory.createForClass(FormDTO);
FormDocument.index({
  project: 1,
  type: 1,
  deleted: 1,
  modified: -1,
})
  .index({
    project: 1,
    name: 1,
    deleted: 1,
  })
  .index(
    {
      deleted: 1,
    },
    {
      partialFilterExpression: { deleted: { $eq: null } },
    },
  )
  .index(
    { machineName: 1 },
    { unique: true, partialFilterExpression: { deleted: { $eq: null } } },
  );
