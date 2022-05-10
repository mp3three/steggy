import { GroupDTO } from '@steggy/controller-shared';
import { Button, Dropdown, Menu, Popconfirm } from 'antd';

import { FD_ICONS, MenuItem, sendRequest } from '../../types';
import { ItemPin } from '../misc';

export function GroupExtraActions(props: {
  group: GroupDTO;
  onClone?: (group: GroupDTO) => void;
  onUpdate: (group?: GroupDTO) => void;
}) {
  async function clone(): Promise<void> {
    const updated = await sendRequest<GroupDTO>({
      method: 'post',
      url: `/group/${props.group._id}/clone`,
    });
    if (props.onClone) {
      props.onClone(updated);
    }
  }

  async function remove(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/group/${props.group._id}`,
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
                    icon={FD_ICONS.get('item_remove')}
                    title={`Are you sure you want to delete ${props.group.friendlyName}?`}
                    onConfirm={() => remove()}
                  >
                    <Button
                      danger
                      style={{ textAlign: 'start', width: '100%' }}
                      icon={FD_ICONS.get('remove')}
                    >
                      Delete Group
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
                  <ItemPin type="group" target={props.group._id} menuItem />
                ),
              },
            ] as MenuItem[]
          }
        ></Menu>
      }
    >
      <Button type="text" size="small">
        {FD_ICONS.get('menu')}
      </Button>
    </Dropdown>
  );
}
