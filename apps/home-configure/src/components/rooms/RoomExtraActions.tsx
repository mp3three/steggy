import { QuestionCircleOutlined } from '@ant-design/icons';
import { RoomDTO } from '@steggy/controller-shared';
import { Button, Dropdown, Menu, Popconfirm } from 'antd';
import React from 'react';

import { FD_ICONS, sendRequest } from '../../types';

export class RoomExtraActions extends React.Component<{
  onClone?: (room: RoomDTO) => void;
  onUpdate: (room?: RoomDTO) => void;
  room?: RoomDTO;
}> {
  override render() {
    return (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="delete">
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                title={`Are you sure you want to delete ${this.props.room.friendlyName}?`}
                onConfirm={() => this.delete()}
              >
                <Button
                  style={{ textAlign: 'start', width: '100%' }}
                  danger
                  icon={FD_ICONS.get('remove')}
                >
                  Delete
                </Button>
              </Popconfirm>
            </Menu.Item>
            <Menu.Item key="clone">
              <Button
                onClick={() => this.clone()}
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

  private async clone(): Promise<void> {
    const cloned = await sendRequest<RoomDTO>({
      method: 'post',
      url: `/room/${this.props.room._id}/clone`,
    });
    if (this.props.onClone) {
      this.props.onClone(cloned);
    }
  }

  private async delete(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/room/${this.props.room._id}`,
    });
    this.props.onUpdate();
  }
}
