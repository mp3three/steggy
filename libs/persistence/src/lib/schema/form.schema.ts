import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FormDocument = SubmissionDTO & Document;

export const FormSchema = SchemaFactory.createForClass(SubmissionDTO);
FormSchema.index({
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
      // eslint-disable-next-line unicorn/no-null
      partialFilterExpression: { deleted: { $eq: null } },
    },
  )
  .index(
    { machineName: 1 },
    // eslint-disable-next-line unicorn/no-null
    { unique: true, partialFilterExpression: { deleted: { $eq: null } } },
  );
