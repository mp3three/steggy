import { ExclamationCircleOutlined } from '@ant-design/icons';
import { RoutineDTO } from '@automagical/controller-shared';
import { is } from '@automagical/utilities';
import {
  Button,
  Card,
  Divider,
  Empty,
  FormInstance,
  Popconfirm,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { ActivateList } from './activate';
import { CommandList } from './command';
import { RoutineActivateDrawer } from './RoutineActivateDrawer';
import { RoutineEnabled } from './RoutineEnabled';
import { RoutineSettings } from './RoutineSettings';

type tState = {
  friendlyName: string;
};

export class RoutineListDetail extends React.Component<
  {
    onUpdate: (routine: RoutineDTO) => void;
    routine: RoutineDTO;
  },
  tState
> {
  override state = {} as tState;
  private activateCreateForm: FormInstance;
  private activateDrawer: RoutineActivateDrawer;
  private get id(): string {
    return this.props.routine._id;
  }

  private get disablePolling(): boolean {
    if (
      !['enable_rules', 'disable_rules'].includes(
        this.props.routine?.enable?.type,
      )
    ) {
      return true;
    }
    return !(this.props.routine.enable?.comparisons ?? []).some(({ type }) =>
      ['webhook', 'template'].includes(type),
    );
  }

  override render() {
    return (
      <Card
        title="Quick Edit"
        extra={
          <>
            <Tooltip
              title={
                <Typography.Paragraph>
                  <Typography.Text strong>POST </Typography.Text>
                  <Typography.Text code>
                    {sendRequest.url(`/routine/${this.props.routine._id}`)}
                  </Typography.Text>
                </Typography.Paragraph>
              }
            >
              <Button
                type="primary"
                size="small"
                disabled={is.empty(this.props.routine?.command)}
                onClick={() => this.activateRoutine()}
              >
                Manual Activate
              </Button>
            </Tooltip>
            <Divider type="vertical" />
            <Popconfirm
              title={`Are you sure you want to delete ${this.props?.routine?.friendlyName}?`}
              onConfirm={() => this.deleteRoutine()}
            >
              <Button
                danger
                type="primary"
                size="small"
                disabled={!this.props.routine}
              >
                Delete
              </Button>
            </Popconfirm>
          </>
        }
      >
        {!this.props.routine ? (
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
        )}
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
}
