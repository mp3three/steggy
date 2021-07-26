import { Inject } from '@nestjs/common';

import { getEBSConnectionToken } from '../../includes/aws/ebs.utils';

export const InjectEBS = (connection?: string): ReturnType<typeof Inject> => {
  return Inject(getEBSConnectionToken(connection));
};
