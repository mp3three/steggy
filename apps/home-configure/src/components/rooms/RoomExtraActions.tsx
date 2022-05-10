import { RoomDTO } from '@steggy/controller-shared';
import { Button, Dropdown, Menu, Popconfirm } from 'antd';

import { FD_ICONS, MenuItem, sendRequest } from '../../types';
import { ItemPin } from '../misc';

export function RoomExtraActions(props: {
  onClone?: (room: RoomDTO) => void;
  onUpdate: (room?: RoomDTO) => void;
  room?: RoomDTO;
}) {
  async function clone(): Promise<void> {
    const cloned = await sendRequest<RoomDTO>({
      method: 'post',
      url: `/room/${props.room._id}/clone`,
    });
    if (props.onClone) {
      props.onClone(cloned);
    }
  }

  async function remove(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/room/${props.room._id}`,
    });
    props.onUpdate();
  }

  return (
    <Dropdown
      overlay={
        <Menu
          items={
            [
              {
                label: (
                  <Popconfirm
                    icon={FD_ICONS.get('delete')}
                    title={`Are you sure you want to delete ${props.room?.friendlyName}?`}
                    onConfirm={() => remove()}
                  >
                    <Button
                      style={{ textAlign: 'start', width: '100%' }}
                      danger
                      icon={FD_ICONS.get('remove')}
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
                  <ItemPin type="room" target={props.room?._id} menuItem />
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
