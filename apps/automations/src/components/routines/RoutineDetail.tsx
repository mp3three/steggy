import DebugStepIntoIcon from '@2fd/ant-design-icons/lib/DebugStepInto';
import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  RoutineActivateDTO,
  RoutineCommandDTO,
  RoutineDTO,
} from '@automagical/controller-shared';
import { TitleCase } from '@automagical/utilities';
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Form,
  FormInstance,
  Input,
  Layout,
  List,
  Popconfirm,
  Popover,
  Row,
  Select,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';
import { RelatedRoutines } from './RelatedRoutines';
import { RoutineActivateDrawer } from './RoutineActivateDrawer';
import { RoutineCommandDrawer } from './RoutineCommandDrawer';

type tStateType = {
  name: string;
  routine: RoutineDTO;
};

export const RoutineDetail = withRouter(
  class extends React.Component<
    { id: string } & RouteComponentProps<{ id: string }>,
    tStateType
  > {
    static propTypes = {
      id: PropTypes.string,
    };
    private activateCreateForm: FormInstance;
    private activateDrawer: RoutineActivateDrawer;
    private commandCreateForm: FormInstance;
    private commandDrawer: RoutineCommandDrawer;

    private get id(): string {
      const { id } = this.props.match.params;
      return id;
    }

    override async componentDidMount(): Promise<void> {
      await this.refresh();
    }

    override render() {
      return (
        <Layout style={{ height: '100%' }} hasSider>
          {this.state?.routine ? (
            <>
              <Layout.Content style={{ margin: '16px' }}>
                <Breadcrumb>
                  <Breadcrumb.Item>
                    <Link to={`/routines`}>Routines</Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <Link to={`/routine/${this.state.routine._id}`}>
                      <Typography.Text
                        editable={{ onChange: name => this.nameUpdate(name) }}
                      >
                        {this.state.name}
                      </Typography.Text>
                    </Link>
                  </Breadcrumb.Item>
                </Breadcrumb>
                <Row gutter={8} style={{ margin: '16px 0 0 0' }}>
                  <Col span={12}>
                    <Card
                      title="Activation events"
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
                        dataSource={this.state.routine.activate}
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
                                  {TitleCase(item.type)}
                                </Button>
                              }
                            />
                            <Popconfirm
                              icon={
                                <QuestionCircleOutlined
                                  style={{ color: 'red' }}
                                />
                              }
                              title={`Are you sure you want to delete ${item.friendlyName}?`}
                              onConfirm={() => this.deleteActivate(item)}
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
                  </Col>
                  <Col span={12}>
                    <Card
                      title="Command actions"
                      extra={
                        <Popconfirm
                          onConfirm={this.validateCommand.bind(this)}
                          icon={
                            <QuestionCircleOutlined
                              style={{ visibility: 'hidden' }}
                            />
                          }
                          title={
                            <Form
                              onFinish={this.validateCommand.bind(this)}
                              ref={form => (this.commandCreateForm = form)}
                            >
                              <Form.Item
                                label="Type"
                                name="type"
                                rules={[{ required: true }]}
                              >
                                <Select
                                  style={{ width: '200px' }}
                                  defaultActiveFirstOption
                                >
                                  <Select.Option value="entity_state">
                                    Entity State
                                  </Select.Option>
                                  <Select.Option value="group_state">
                                    Group State
                                  </Select.Option>
                                  <Select.Option value="group_action">
                                    Group Action
                                  </Select.Option>
                                  <Select.Option value="room_state">
                                    Room State
                                  </Select.Option>
                                  <Select.Option value="send_notification">
                                    Send Notification
                                  </Select.Option>
                                  <Select.Option value="stop_processing">
                                    Stop Processing
                                  </Select.Option>
                                  <Select.Option value="trigger_routine">
                                    Trigger Routine
                                  </Select.Option>
                                  <Select.Option value="webhook">
                                    Webhook
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
                        dataSource={this.state.routine.command}
                        renderItem={item => (
                          <List.Item
                            key={item.id}
                            onClick={() => this.commandDrawer.load(item)}
                          >
                            <List.Item.Meta
                              title={
                                <Typography.Text
                                  onClick={e => e.stopPropagation()}
                                  editable={{
                                    onChange: value =>
                                      this.renameCommand(item, value),
                                  }}
                                >
                                  {item.friendlyName}
                                </Typography.Text>
                              }
                              description={TitleCase(item.type)}
                            />
                            <Popconfirm
                              icon={
                                <QuestionCircleOutlined
                                  style={{ color: 'red' }}
                                />
                              }
                              title={`Are you sure you want to delete ${item.friendlyName}?`}
                              onConfirm={() => this.deleteCommand(item)}
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
                  </Col>
                </Row>
                <Row gutter={8} style={{ marginTop: '16px' }}>
                  <Col span={24}>
                    <Card title="Meta">
                      <Row gutter={16}>
                        <Col span={12}>
                          <Card
                            type="inner"
                            title="Settings"
                            style={{ height: '100%' }}
                          >
                            <Tooltip
                              title={
                                <Typography>
                                  <Typography.Paragraph>
                                    When checked, a command action must fully
                                    complete prior to the next command running.
                                    This allows some commands, such as
                                    <Typography.Text code>
                                      Stop Processing
                                    </Typography.Text>
                                    to affect/prevent execution of following
                                    commands. Entity state changes require a
                                    confirmation from Home Assistant, which may
                                    be affected by real world conditions.
                                  </Typography.Paragraph>
                                  <Divider />
                                  <Typography.Paragraph>
                                    While unchecked, actions will be initiated
                                    at the simultaniously, having no influence
                                    each other. Entity state changes are
                                    performed in a "fire and forget" manner.
                                  </Typography.Paragraph>
                                </Typography>
                              }
                            >
                              <Checkbox
                                checked={this.state.routine.sync}
                                onChange={({ target }) =>
                                  this.setSync(target.checked)
                                }
                              >
                                Synchronous command processing
                              </Checkbox>
                            </Tooltip>
                          </Card>
                        </Col>
                        <Col span={12}>
                          <Card type="inner" title="Related Routines">
                            <RelatedRoutines routine={this.state.routine} />
                          </Card>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              </Layout.Content>
              <Layout.Sider style={{ padding: '16px' }}>
                <Popover
                  title="Activation endpoint"
                  content={
                    <Form.Item label="POST">
                      <Input value={`/routine/${this.id}`} readOnly />
                    </Form.Item>
                  }
                >
                  <Button
                    onClick={this.manualActivate.bind(this)}
                    icon={<DebugStepIntoIcon />}
                  >
                    Manual activate
                  </Button>
                </Popover>
              </Layout.Sider>
              <RoutineActivateDrawer
                routine={this.state.routine}
                onUpdate={this.refresh.bind(this)}
                ref={i => (this.activateDrawer = i)}
              />
              <RoutineCommandDrawer
                routine={this.state.routine}
                onUpdate={this.refresh.bind(this)}
                ref={i => (this.commandDrawer = i)}
              />
            </>
          ) : (
            <Layout.Content>
              <Spin size="large" tip="Loading..." />
            </Layout.Content>
          )}
        </Layout>
      );
    }

    private async deleteActivate(item: RoutineActivateDTO): Promise<void> {
      const routine = await sendRequest<RoutineDTO>(
        `/routine/${this.id}/activate/${item.id}`,
        { method: 'delete' },
      );
      this.refresh(routine);
    }

    private async deleteCommand(item: RoutineCommandDTO): Promise<void> {
      const routine = await sendRequest<RoutineDTO>(
        `/routine/${this.id}/command/${item.id}`,
        { method: 'delete' },
      );
      this.refresh(routine);
    }

    private async manualActivate(): Promise<void> {
      await sendRequest(`/routine/${this.id}`, { method: 'post' });
    }

    private async nameUpdate(name: string): Promise<void> {
      if (name === this.state.routine.friendlyName) {
        return;
      }
      const routine = await sendRequest<RoutineDTO>(`/routine/${this.id}`, {
        body: JSON.stringify({
          friendlyName: name,
        }),
        method: 'put',
      });
      this.setState({ name, routine });
    }

    private async refresh(routine?: RoutineDTO): Promise<void> {
      routine ??= await sendRequest<RoutineDTO>(`/routine/${this.id}`);
      this.setState({ name: routine.friendlyName, routine });
    }

    private async renameActivate(
      activate: RoutineActivateDTO,
      friendlyName: string,
    ): Promise<void> {
      const { routine } = this.state;
      const updated = await sendRequest<RoutineDTO>(`/routine/${routine._id}`, {
        body: JSON.stringify({
          activate: routine.activate.map(i =>
            i.id === activate.id
              ? {
                  ...activate,
                  friendlyName,
                }
              : i,
          ),
        }),
        method: 'put',
      });
      this.setState({ routine: updated });
    }

    private async renameCommand(
      command: RoutineCommandDTO,
      friendlyName: string,
    ): Promise<void> {
      const { routine } = this.state;
      const updated = await sendRequest<RoutineDTO>(`/routine/${routine._id}`, {
        body: JSON.stringify({
          command: routine.command.map(i =>
            i.id === command.id
              ? {
                  ...command,
                  friendlyName,
                }
              : i,
          ),
        }),
        method: 'put',
      });
      this.setState({ routine: updated });
    }

    private async setSync(sync: boolean) {
      const routine = await sendRequest<RoutineDTO>(
        `/routine/${this.state.routine._id}`,
        { body: JSON.stringify({ sync }), method: 'put' },
      );
      this.setState({ routine });
    }

    private async validateActivate(): Promise<void> {
      try {
        const values = await this.activateCreateForm.validateFields();
        this.activateDrawer.load(values as RoutineActivateDTO);
      } catch (error) {
        console.error(error);
      }
    }

    private async validateCommand(): Promise<void> {
      try {
        const values = await this.commandCreateForm.validateFields();
        values.friendlyName = `${TitleCase(values.type)} action`;
        this.commandDrawer.load(values as RoutineCommandDTO);
      } catch (error) {
        console.error(error);
      }
    }
  },
);
