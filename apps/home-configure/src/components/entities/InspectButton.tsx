import { HassStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import { Button, Drawer, notification, Typography } from 'antd';
import React, { useState } from 'react';

import { sendRequest } from '../../types';
import { EntityInspect } from './EntityInspect';

export function EntityInspectButton(props: { entity_id: string }) {
  const [entity, setEntity] = useState<HassStateDTO>();
  const [flags, setFlags] = useState<string[]>();

  async function load(): Promise<void> {
    await Promise.all(
      [
        async () => {
          const entity = await sendRequest<HassStateDTO>({
            url: `/entity/id/${props.entity_id}`,
          });
          if (is.undefined(entity.attributes)) {
            notification.open({
              description: (
                <Typography>
                  {`Server returned bad response. Verify that `}
                  <Typography.Text code>{props.entity_id}</Typography.Text>
                  {' still exists?'}
                </Typography>
              ),
              message: 'Entity not found',
              type: 'error',
            });
            return;
          }
          setEntity(entity);
        },
        async () => {
          const flags = await sendRequest<string[]>({
            url: `/entity/flags/${props.entity_id}`,
          });
          setFlags(flags);
        },
      ].map(async f => await f()),
    );
  }

  return (
    <>
      <Drawer
        visible={!is.undefined(entity)}
        onClose={() => {
          setEntity(undefined);
          setFlags([]);
        }}
        title={entity?.attributes?.friendly_name ?? props.entity_id}
        size="large"
      >
        <EntityInspect
          onUpdate={entity => setEntity(entity)}
          entity={entity}
          flags={flags}
          onFlagsUpdate={flags => setFlags(flags)}
        />
      </Drawer>
      <Button size="small" type="text" onClick={() => load()}>
        {props.entity_id}
      </Button>
    </>
  );
}
