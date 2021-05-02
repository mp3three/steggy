import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubmissionDocument = SubmissionDTO & Document;

export const SubmissionSchema = SchemaFactory.createForClass(SubmissionDTO);
SubmissionSchema.index({
  project: 1,
  deleted: 1,
})
  .index({
    project: 1,
    form: 1,
    deleted: 1,
  })
  .index({
    project: 1,
    form: 1,
    deleted: 1,
    created: -1,
  })
  .index(
    {
      deleted: 1,
    },
    {
      partialFilterExpression: { deleted: { $eq: null } },
    },
  )
  .index({
    form: 1,
    deleted: 1,
    created: -1,
  });
