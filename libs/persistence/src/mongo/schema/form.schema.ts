import { FormDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FormDocument = FormDTO & Document;

export const FormSchema = SchemaFactory.createForClass(FormDTO);
FormSchema.index({
  deleted: 1,
  modified: -1,
  project: 1,
  type: 1,
})
  .index({
    deleted: 1,
    name: 1,
    project: 1,
  })
  .index(
    {
      deleted: 1,
    },
    {
      // eslint-disable-next-line unicorn/no-null
      partialFilterExpression: { deleted: { $eq: null } },
    },
  )
  .index(
    { machineName: 1 },
    // eslint-disable-next-line unicorn/no-null
    { partialFilterExpression: { deleted: { $eq: null } }, unique: true },
  );
