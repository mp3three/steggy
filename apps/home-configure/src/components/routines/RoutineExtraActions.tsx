import { RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Dropdown, Menu, Popconfirm } from 'antd';
import React from 'react';

import { FD_ICONS, sendRequest } from '../../types';

export class RoutineExtraActions extends React.Component<{
  onClone?: (routine: RoutineDTO) => void;
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}> {
  override render() {
    return (
      <Dropdown
        overlay={
          <Menu>
            <Menu.Item key="activate">
              <Button
                type="primary"
                style={{ textAlign: 'start', width: '100%' }}
                icon={FD_ICONS.get('execute')}
                disabled={is.empty(this.props.routine?.command)}
                onClick={() => this.activateRoutine()}
              >
                Manual Activate
              </Button>
            </Menu.Item>
            <Menu.Item key="delete">
              <Popconfirm
                title={`Are you sure you want to delete ${this.props?.routine?.friendlyName}?`}
                onConfirm={() => this.deleteRoutine()}
              >
                <Button
                  danger
                  style={{ textAlign: 'start', width: '100%' }}
                  icon={FD_ICONS.get('remove')}
                  disabled={!this.props.routine}
                >
                  Delete
                </Button>
              </Popconfirm>
            </Menu.Item>
            <Menu.Item>
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

  private async activateRoutine(): Promise<void> {
    await sendRequest({
      method: 'post',
      url: `/routine/${this.props.routine._id}`,
    });
  }

  private async clone(): Promise<void> {
    const cloned = await sendRequest<RoutineDTO>({
      method: 'post',
      url: `/routine/${this.props.routine._id}/clone`,
    });
    if (this.props.onClone) {
      this.props.onClone(cloned);
    }
  }

  private async deleteRoutine(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(undefined);
  }
}
