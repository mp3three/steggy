import MenuIcon from '@2fd/ant-design-icons/lib/Menu';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Menu,
  Popconfirm,
  Space,
  Tabs,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { ActivateList } from './activate';
import { CommandList } from './command';
import { RoutineEnabled } from './RoutineEnabled';
import { RoutineSettings } from './RoutineSettings';

type tState = {
  friendlyName: string;
};

export class RoutineListDetail extends React.Component<
  {
    nested?: boolean;
    onUpdate: (routine: RoutineDTO) => void;
    routine: RoutineDTO;
  },
  tState
> {
  override state = {} as tState;

  override render() {
    if (this.props.nested) {
      return this.renderCard();
    }
    return (
      <Card
        title="Quick Edit"
        extra={
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item>
                  <Button
                    type="primary"
                    style={{ width: '100%' }}
                    size="small"
                    disabled={is.empty(this.props.routine?.command)}
                    onClick={() => this.activateRoutine()}
                  >
                    Manual Activate
                  </Button>
                </Menu.Item>
                <Menu.Item>
                  <Popconfirm
                    title={`Are you sure you want to delete ${this.props?.routine?.friendlyName}?`}
                    onConfirm={() => this.deleteRoutine()}
                  >
                    <Button
                      danger
                      type="primary"
                      style={{ width: '100%' }}
                      size="small"
                      disabled={!this.props.routine}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="text">
              <MenuIcon />
            </Button>
          </Dropdown>
        }
      >
        {this.renderCard()}
      </Card>
    );
  }

  private async activateRoutine(): Promise<void> {
    await sendRequest({
      method: 'post',
      url: `/routine/${this.props.routine._id}`,
    });
  }

  private async deleteRoutine(): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(undefined);
  }

  private async rename(friendlyName: string): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      body: { friendlyName },
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(routine);
  }

  private renderCard() {
    return !this.props.routine ? (
      <Empty description="Select a routine" />
    ) : (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Title
          level={3}
          editable={{ onChange: value => this.rename(value) }}
        >
          {this.props.routine.friendlyName}
        </Typography.Title>
        <Tabs type="card">
          <Tabs.TabPane tab="Enabled" key="enabled">
            <RoutineEnabled
              routine={this.props.routine}
              onUpdate={routine => this.props.onUpdate(routine)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                {is.empty(this.props.routine.activate) ? (
                  <ExclamationCircleOutlined />
                ) : undefined}
                Activation Events
              </span>
            }
            key="activate"
          >
            <ActivateList
              routine={this.props.routine}
              onUpdate={routine => this.props.onUpdate(routine)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              <span>
                {is.empty(this.props.routine.command) ? (
                  <ExclamationCircleOutlined />
                ) : undefined}
                Commands
              </span>
            }
            key="command"
          >
            <CommandList
              routine={this.props.routine}
              onUpdate={routine => this.props.onUpdate(routine)}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Settings" key="settings">
            <RoutineSettings
              routine={this.props.routine}
              onUpdate={routine => this.props.onUpdate(routine)}
            />
          </Tabs.TabPane>
        </Tabs>
      </Space>
    );
  }
}
