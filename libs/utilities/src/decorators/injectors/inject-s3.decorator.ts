import { Inject } from '@nestjs/common';

import { getS3ConnectionToken } from '../../includes/aws/s3.utils';

export const InjectS3 = (connection?: string): ReturnType<typeof Inject> => {
  return Inject(getS3ConnectionToken(connection));
};
