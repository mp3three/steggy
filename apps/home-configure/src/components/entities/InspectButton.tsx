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
          setFlags(
            await sendRequest<string[]>({
              url: `/entity/flags/${props.entity_id}`,
            }),
          );
        },
      ].map(f => f()),
    );
  }

  async function updateName(name: string): Promise<void> {
    const update = await sendRequest<HassStateDTO>({
      body: { name },
      method: 'put',
      url: `/entity/rename/${entity.entity_id}`,
    });
    setEntity(update);
  }

  return (
    <>
      <Drawer
        visible={!is.undefined(entity)}
        onClose={() => {
          setEntity(undefined);
          setFlags([]);
        }}
        title={
          <Typography.Text
            editable={{
              onChange: friendlyName => updateName(friendlyName),
            }}
          >
            {entity?.attributes?.friendly_name}
          </Typography.Text>
        }
        size="large"
      >
        <EntityInspect
          onUpdate={entity => setEntity(entity)}
          entity={entity}
          flags={flags}
          nested
          onFlagsUpdate={flags => setFlags(flags)}
        />
      </Drawer>
      <Button
        size="small"
        type={is.undefined(entity) ? 'text' : 'primary'}
        onClick={() => load()}
      >
        {props.entity_id}
      </Button>
    </>
  );
}
