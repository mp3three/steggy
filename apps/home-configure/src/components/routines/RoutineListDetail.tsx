import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import {
  CloseOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  RoutineActivateDTO,
  RoutineDTO,
  RoutineEnableDTO,
} from '@automagical/controller-shared';
import { TitleCase } from '@automagical/utilities';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Form,
  FormInstance,
  Input,
  List,
  Popconfirm,
  Radio,
  Select,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { sendRequest } from '../../types';
import { CommandList, StopProcessingCommand } from './command';
import { RoutineActivateDrawer } from './RoutineActivateDrawer';
import { RoutineCommandDrawer } from './RoutineCommandDrawer';

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
  private commandCreateForm: FormInstance;
  private commandDrawer: RoutineCommandDrawer;
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
        type="inner"
        title="Quick Edit"
        extra={
          <>
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
                <Card type="inner">
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
                </Card>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Activation Events" key="activate">
                <Card
                  type="inner"
                  extra={
                    <Popconfirm
                      onConfirm={this.validateActivate.bind(this)}
                      icon={
                        <QuestionCircleOutlined
                          style={{ visibility: 'hidden' }}
                        />
                      }
                      title={
                        <Form
                          onFinish={this.validateActivate.bind(this)}
                          ref={form => (this.activateCreateForm = form)}
                        >
                          <Form.Item
                            label="Friendly Name"
                            name="friendlyName"
                            rules={[{ required: true }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label="Type"
                            name="type"
                            rules={[{ required: true }]}
                          >
                            <Select>
                              <Select.Option value="kunami">
                                Sequence
                              </Select.Option>
                              <Select.Option value="schedule">
                                Cron Schedule
                              </Select.Option>
                              <Select.Option value="state_change">
                                State Change
                              </Select.Option>
                              <Select.Option value="solar">
                                Solar Event
                              </Select.Option>
                            </Select>
                          </Form.Item>
                        </Form>
                      }
                    >
                      <Button size="small" icon={<PlusBoxMultiple />}>
                        Add new
                      </Button>
                    </Popconfirm>
                  }
                >
                  <List
                    dataSource={this.props.routine.activate}
                    renderItem={item => (
                      <List.Item
                        key={item.id}
                        onClick={() => this.activateDrawer.load(item)}
                      >
                        <List.Item.Meta
                          title={
                            <Typography.Text
                              onClick={e => {
                                e.stopPropagation();
                              }}
                              editable={{
                                onChange: value =>
                                  this.renameActivate(item, value),
                              }}
                            >
                              {item.friendlyName}
                            </Typography.Text>
                          }
                          description={
                            <Button
                              onClick={() => this.activateDrawer.load(item)}
                              type="text"
                            >
                              {TitleCase(
                                item.type === 'kunami' ? 'sequence' : item.type,
                              )}
                            </Button>
                          }
                        />
                        <Popconfirm
                          icon={
                            <QuestionCircleOutlined style={{ color: 'red' }} />
                          }
                          title={`Are you sure you want to delete ${item.friendlyName}?`}
                          onConfirm={e => {
                            this.deleteActivate(item);
                            e?.stopPropagation();
                          }}
                        >
                          <Button
                            danger
                            type="text"
                            onClick={e => e.stopPropagation()}
                          >
                            <CloseOutlined />
                          </Button>
                        </Popconfirm>
                      </List.Item>
                    )}
                  />
                </Card>

                <RoutineActivateDrawer
                  routine={this.props.routine}
                  onUpdate={r => this.props.onUpdate(r)}
                  ref={i => (this.activateDrawer = i)}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Commands" key="command">
                <CommandList
                  routine={this.props.routine}
                  onUpdate={routine => this.props.onUpdate(routine)}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Settings" key="settings">
                <Card type="inner">
                  <Tooltip
                    title={
                      <Typography>
                        <Typography.Paragraph>
                          When checked, a command action must fully complete
                          prior to the next command running. This allows some
                          commands, such as
                          <Typography.Text code>
                            Stop Processing
                          </Typography.Text>
                          to affect/prevent execution of following commands.
                          Entity state changes require a confirmation from Home
                          Assistant, which may be affected by real world
                          conditions.
                        </Typography.Paragraph>
                        <Divider />
                        <Typography.Paragraph>
                          While unchecked, actions will be initiated at the
                          simultaniously, having no influence each other. Entity
                          state changes are performed in a "fire and forget"
                          manner.
                        </Typography.Paragraph>
                      </Typography>
                    }
                  >
                    <Checkbox
                      checked={this.props.routine.sync}
                      onChange={({ target }) => this.setSync(target.checked)}
                    >
                      Synchronous command processing
                    </Checkbox>
                  </Tooltip>
                </Card>
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

  private async deleteActivate(item: RoutineActivateDTO): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      method: 'delete',
      url: `/routine/${this.id}/activate/${item.id}`,
    });
    this.props.onUpdate(routine);
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

  private async renameActivate(
    activate: RoutineActivateDTO,
    friendlyName: string,
  ): Promise<void> {
    const { routine } = this.props;
    const updated = await sendRequest<RoutineDTO>({
      body: {
        activate: routine.activate.map(i =>
          i.id === activate.id
            ? {
                ...activate,
                friendlyName,
              }
            : i,
        ),
      },
      method: 'put',
      url: `/routine/${routine._id}`,
    });
    this.props.onUpdate(updated);
  }

  private async setPolling(poll: number): Promise<void> {
    console.log(poll);
    const updated = await sendRequest<RoutineDTO>({
      body: {
        enable: { ...this.props.routine.enable, poll },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(updated);
  }

  private async setSync(sync: boolean) {
    const routine = await sendRequest<RoutineDTO>({
      body: { sync },
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(routine);
  }

  private async setType(type: string): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      body: {
        enable: { ...this.props.routine.enable, type },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(updated);
  }

  private async updateComparisons(
    update: Partial<RoutineEnableDTO>,
  ): Promise<void> {
    const updated = await sendRequest<RoutineDTO>({
      body: {
        enable: { ...this.props.routine.enable, ...update },
      } as Partial<RoutineDTO>,
      method: 'put',
      url: `/routine/${this.props.routine._id}`,
    });
    this.props.onUpdate(updated);
  }

  private async validateActivate(): Promise<void> {
    try {
      const values = await this.activateCreateForm.validateFields();
      this.activateDrawer.load(values as RoutineActivateDTO);
    } catch (error) {
      console.error(error);
    }
  }
}
