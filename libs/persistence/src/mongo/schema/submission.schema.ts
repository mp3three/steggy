import { SubmissionDTO } from '@formio/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubmissionDocument = SubmissionDTO & Document;

export const SubmissionSchema = SchemaFactory.createForClass(SubmissionDTO);
SubmissionSchema.index({
  deleted: 1,
  project: 1,
})
  .index({
    deleted: 1,
    form: 1,
    project: 1,
  })
  .index({
    created: -1,
    deleted: 1,
    form: 1,
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
  .index({
    created: -1,
    deleted: 1,
    form: 1,
  });
