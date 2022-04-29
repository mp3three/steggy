import { RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Dropdown, Menu, Popconfirm } from 'antd';
import React from 'react';

import { FD_ICONS, sendRequest } from '../../types';

export function RoutineExtraActions(props: {
  onClone?: (routine: RoutineDTO) => void;
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  async function activateRoutine(): Promise<void> {
    await sendRequest({
      method: 'post',
      url: `/routine/${props.routine._id}`,
    });
  }

  async function clone(): Promise<void> {
    const cloned = await sendRequest<RoutineDTO>({
      method: 'post',
      url: `/routine/${props.routine._id}/clone`,
    });
    if (props.onClone) {
      props.onClone(cloned);
    }
  }

  async function deleteRoutine(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/routine/${props.routine._id}`,
    });
    props.onUpdate(undefined);
  }
  return (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item key="activate">
            <Button
              type="primary"
              style={{ textAlign: 'start', width: '100%' }}
              icon={FD_ICONS.get('execute')}
              disabled={is.empty(props.routine?.command)}
              onClick={() => activateRoutine()}
            >
              Manual Activate
            </Button>
          </Menu.Item>
          <Menu.Item key="delete">
            <Popconfirm
              title={`Are you sure you want to delete ${props?.routine?.friendlyName}?`}
              onConfirm={() => deleteRoutine()}
            >
              <Button
                danger
                style={{ textAlign: 'start', width: '100%' }}
                icon={FD_ICONS.get('remove')}
                disabled={!props.routine}
              >
                Delete
              </Button>
            </Popconfirm>
          </Menu.Item>
          <Menu.Item>
            <Button
              onClick={() => clone()}
              icon={FD_ICONS.get('clone')}
              style={{ textAlign: 'start', width: '100%' }}
            >
              Clone
            </Button>
          </Menu.Item>
        </Menu>
      }
    >
      <Button type="text" size="small">
        {FD_ICONS.get('menu')}
      </Button>
    </Dropdown>
  );
}
