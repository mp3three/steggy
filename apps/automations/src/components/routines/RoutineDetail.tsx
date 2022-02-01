import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  RoutineActivateDTO,
  RoutineCommandDTO,
  RoutineDTO,
} from '@text-based/controller-shared';
import { TitleCase } from '@text-based/utilities';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Layout,
  List,
  Popconfirm,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';
import { RoutineActivateDrawer } from './RoutineActivateDrawer';

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
                          <List.Item key={item.id}>
                            <List.Item.Meta
                              title={
                                <Button
                                  onClick={() => this.activateDrawer.load(item)}
                                  type="text"
                                >
                                  {item.friendlyName}
                                </Button>
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
                              onConfirm={() => this.deleteActivate(item)}
                            >
                              <Button danger type="text">
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
                          onConfirm={this.validateActivate.bind(this)}
                          icon={
                            <QuestionCircleOutlined
                              style={{ visibility: 'hidden' }}
                            />
                          }
                          title={
                            <Form
                              onFinish={this.validateActivate.bind(this)}
                              ref={form => (this.commandCreateForm = form)}
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
                      <List />
                    </Card>
                  </Col>
                </Row>
              </Layout.Content>
              <Layout.Sider>Sider</Layout.Sider>
              <RoutineActivateDrawer
                routine={this.state.routine}
                onUpdate={this.refresh.bind(this)}
                ref={i => (this.activateDrawer = i)}
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
        // this.activateDrawer.load(values as RoutineCommandDTO);
      } catch (error) {
        console.error(error);
      }
    }
  },
);
