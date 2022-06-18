import {
  RoutineActivateOptionsDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Dropdown, Menu, Popconfirm } from 'antd';

import { FD_ICONS, MenuItem, sendRequest } from '../../types';
import { ItemPin } from '../misc';

export function RoutineExtraActions(props: {
  onClone?: (routine: RoutineDTO) => void;
  onLoad?: (routine: string) => void;
  onUpdate?: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  async function activateRoutine(): Promise<void> {
    await sendRequest({
      body: {
        force: true,
        source: 'Manual Activate',
      } as RoutineActivateOptionsDTO,
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
    if (props.onUpdate) {
      props.onUpdate(undefined);
    }
  }

  function promptId(): void {
    const id = prompt('Routine ID');
    if (!is.empty(id)) {
      props.onLoad(id);
    }
  }

  return (
    <Dropdown
      overlay={
        <Menu
          items={
            [
              {
                label: (
                  <Button
                    type="primary"
                    style={{ textAlign: 'start', width: '100%' }}
                    icon={FD_ICONS.get('execute')}
                    disabled={is.empty(props.routine?.command)}
                    onClick={() => activateRoutine()}
                  >
                    Manual Activate
                  </Button>
                ),
              },
              {
                label: (
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
                ),
              },
              {
                label: (
                  <Button
                    onClick={() => clone()}
                    icon={FD_ICONS.get('clone')}
                    style={{ textAlign: 'start', width: '100%' }}
                  >
                    Clone
                  </Button>
                ),
              },
              {
                label: (
                  <ItemPin
                    type="routine"
                    target={props.routine?._id}
                    menuItem
                  />
                ),
              },
              {
                label: (
                  <Button
                    onClick={() => promptId()}
                    icon={FD_ICONS.get('folder_open')}
                    style={{ textAlign: 'start', width: '100%' }}
                  >
                    Load by id
                  </Button>
                ),
              },
            ] as MenuItem[]
          }
        />
      }
    >
      <Button type="text" size="small">
        {FD_ICONS.get('menu')}
      </Button>
    </Dropdown>
  );
}
