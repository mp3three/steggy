import { QuestionCircleOutlined } from '@ant-design/icons';
import { GroupDTO } from '@steggy/controller-shared';
import { Button, Dropdown, Menu, Popconfirm } from 'antd';
import React from 'react';

import { FD_ICONS, sendRequest } from '../../types';

export class GroupExtraActions extends React.Component<{
  group: GroupDTO;
  onClone?: (group: GroupDTO) => void;
  onUpdate: (group?: GroupDTO) => void;
}> {
  override render() {
    return (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="delete">
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                title={`Are you sure you want to delete ${this.props.group.friendlyName}?`}
                onConfirm={() => this.delete()}
              >
                <Button
                  danger
                  style={{ textAlign: 'start', width: '100%' }}
                  icon={FD_ICONS.get('remove')}
                >
                  Delete Group
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
    const updated = await sendRequest<GroupDTO>({
      method: 'post',
      url: `/group/${this.props.group._id}/clone`,
    });
    if (this.props.onClone) {
      this.props.onClone(updated);
    }
  }

  private async delete(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/group/${this.props.group._id}`,
    });
    this.props.onUpdate();
  }
}
