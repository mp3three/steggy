import { SettingOutlined } from '@ant-design/icons';
import { RoutineDTO } from '@automagical/controller-shared';
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
} from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { sendRequest } from '../../types';
import { StopProcessingCommand } from './command';

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

  override componentDidMount(): void {
    this.setState({ friendlyName: this.props.routine?.friendlyName });
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
            <Form.Item label="Friendly Name">
              <Input
                value={this.state.friendlyName}
                onChange={({ target }) =>
                  this.setState({ friendlyName: target.value })
                }
                onBlur={() => this.rename()}
              />
            </Form.Item>
            <Tabs type="card">
              <Tabs.TabPane tab="Enabled" key="enabled">
                <Form.Item label="Enable type">
                  <Radio.Group
                    value={this.props.routine.enable?.type ?? 'enable'}
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
                    value={this.props.routine.enable?.poll ?? 60 * 60}
                    suffix="seconds"
                  />
                </Form.Item>
                <Divider orientation="left">Rules</Divider>
                <StopProcessingCommand
                  disabled
                  command={this.props.routine?.enable}
                  onUpdate={() => {
                    //
                  }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab="Activate & Command"
                key="linked"
              ></Tabs.TabPane>
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

  private async rename(): Promise<void> {
    await sendRequest({
      body: { friendlyName: this.state.friendlyName },
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate();
  }
}
