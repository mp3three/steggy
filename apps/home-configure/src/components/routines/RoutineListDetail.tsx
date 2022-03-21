import { SettingOutlined } from '@ant-design/icons';
import { RoutineDTO, RoutineEnableDTO } from '@automagical/controller-shared';
import {
  Button,
  Card,
  Divider,
  Empty,
  Form,
  Input,
  Popconfirm,
  Radio,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { sendRequest } from '../../types';
import { StopProcessingCommand } from './command';
import { RoutineMiniActivate } from './RoutineMiniActivate';

type tState = {
  friendlyName: string;
};

export class RoutineListDetail extends React.Component<
  {
    onUpdate: () => void;
    routine: RoutineDTO;
  },
  tState
> {
  override state = {} as tState;

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
        type="inner"
        title="Quick Edit"
        extra={
          <>
            {this.props.routine ? (
              <>
                <Link to={`/routine/${this.props.routine._id}`}>
                  <SettingOutlined /> Configuration
                </Link>
                <Divider type="vertical" />
              </>
            ) : undefined}
            <Button
              type="primary"
              size="small"
              disabled={!this.props.routine}
              onClick={this.activateRoutine.bind(this)}
            >
              Manual Activate
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title={`Are you sure you want to delete ${this.props?.routine?.friendlyName}?`}
              onConfirm={this.deleteRoutine.bind(this)}
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
                <Form.Item label="Enable type">
                  <Radio.Group
                    value={this.props.routine.enable?.type ?? 'enable'}
                    onChange={({ target }) => this.setType(target.value)}
                  >
                    <Radio.Button value="enable">Enable</Radio.Button>
                    <Radio.Button value="disable">Disable</Radio.Button>
                    <Radio.Button value="enable_rules">
                      Enable w/ rules
                    </Radio.Button>
                    <Radio.Button value="disable_rules">
                      Disable w/ rules
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  label={
                    <Tooltip title="Rules involving template / webhook tests work through polling">
                      Polling Interval
                    </Tooltip>
                  }
                >
                  <Input
                    type="number"
                    defaultValue={this.props.routine.enable?.poll ?? 60 * 60}
                    suffix="seconds"
                    disabled={this.disablePolling}
                    onChange={({ target }) =>
                      this.setPolling(Number(target.value))
                    }
                  />
                </Form.Item>
                <Divider orientation="left">Rules</Divider>
                <StopProcessingCommand
                  disabled={
                    !['enable_rules', 'disable_rules'].includes(
                      this.props.routine?.enable?.type,
                    )
                  }
                  command={this.props.routine?.enable}
                  onUpdate={update => this.updateComparisons(update)}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Activate & Command" key="linked">
                <RoutineMiniActivate
                  routine={this.props.routine}
                  onUpdate={() => this.props.onUpdate()}
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
    this.props.onUpdate();
  }

  private async rename(friendlyName: string): Promise<void> {
    await sendRequest<RoutineDTO>({
      body: { friendlyName },
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate();
  }

  private async setPolling(poll: number): Promise<void> {
    console.log(poll);
    await sendRequest<RoutineDTO>({
      body: {
        enable: { ...this.props.routine.enable, poll },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate();
  }

  private async setType(type: string): Promise<void> {
    await sendRequest<RoutineDTO>({
      body: {
        enable: { ...this.props.routine.enable, type },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate();
  }

  private async updateComparisons(
    update: Partial<RoutineEnableDTO>,
  ): Promise<void> {
    await sendRequest<RoutineDTO>({
      body: {
        enable: { ...this.props.routine.enable, ...update },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate();
  }
}
