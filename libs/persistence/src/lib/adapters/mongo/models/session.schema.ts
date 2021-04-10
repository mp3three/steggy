import { CreateSchema, form, owner, project } from './common.schema';

export const SessionDefinition = {
  submission: owner,
  project,
  form,
  logout: {
    type: Date,
  },
  source: {
    type: String,
  },
};
export const SessionSchema = CreateSchema(SessionDefinition, {
  minimize: true,
  machineName: true,
});
