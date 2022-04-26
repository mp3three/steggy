import { ExclamationCircleOutlined } from '@ant-design/icons';
import { RoutineDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Card, Empty, Space, Tabs, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { ActivateList } from './activate';
import { CommandList } from './command';
import { RoutineEnabled } from './RoutineEnabled';
import { RoutineExtraActions } from './RoutineExtraActions';
import { RoutineSettings } from './RoutineSettings';

type tState = {
  friendlyName: string;
};

export class RoutineListDetail extends React.Component<
  {
    nested?: boolean;
    onClone?: (routine: RoutineDTO) => void;
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
        title="Routine details"
        extra={
          !this.props.routine ? undefined : (
            <RoutineExtraActions
              routine={this.props.routine}
              onClone={this.props.onClone}
              onUpdate={this.props.onUpdate}
            />
          )
        }
      >
        {this.renderCard()}
      </Card>
    );
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
