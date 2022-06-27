import { Tooltip, Typography } from 'antd';

import { FD_ICONS } from '../../types';

export function SecretsSuffix() {
  return (
    <Tooltip
      title={
        <>
          {`Accepts `}
          <Typography.Text code>{`{{secrets}}`}</Typography.Text>
          {` substitutions`}
        </>
      }
      placement="left"
    >
      {FD_ICONS.get('information')}
    </Tooltip>
  );
}
