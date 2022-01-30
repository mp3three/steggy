import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { RoutineDTO } from '@text-based/controller-shared';
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

    private get id(): string {
      const { id } = this.props.match.params;
      return id;
    }

    override async componentDidMount(): Promise<void> {
      await this.refresh();
    }

    override render() {
      return (
        <Layout style={{ height: '100%' }}>
          {this.state?.routine ? (
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
                              label="Friendly Name"
                              name="type"
                              rules={[{ required: true }]}
                            >
                              <Select>
                                <Select.Option value="kunami">
                                  Combo Code
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
                          Create new
                        </Button>
                      </Popconfirm>
                    }
                  >
                    <List />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Command actions">
                    <List />
                  </Card>
                </Col>
              </Row>
            </Layout.Content>
          ) : (
            <Layout.Content>
              <Spin size="large" tip="Loading..." />
            </Layout.Content>
          )}
        </Layout>
      );
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

    private async refresh(): Promise<void> {
      const routine = await sendRequest<RoutineDTO>(`/routine/${this.id}`);
      this.setState({ name: routine.friendlyName, routine });
    }

    private async validateActivate(): Promise<void> {
      try {
        const values = await this.activateCreateForm.validateFields();
        const routine = await sendRequest<RoutineDTO>(
          `/routine/${this.id}/activate`,
          {
            body: JSON.stringify(values),
            method: 'post',
          },
        );
        this.activateCreateForm.resetFields();
        this.setState({ routine });
      } catch (error) {
        console.error(error);
      }
    }
  },
);
