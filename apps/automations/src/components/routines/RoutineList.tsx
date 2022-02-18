import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { RoutineDTO } from '@text-based/controller-shared';
import { is } from '@text-based/utilities';
import {
  Breadcrumb,
  Button,
  Card,
  Form,
  FormInstance,
  Input,
  Layout,
  List,
  Popconfirm,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';

type tState = {
  routines: RoutineDTO[];
  search: string;
};

export const RoutineList = withRouter(
  class extends React.Component<
    { prop: unknown } & RouteComponentProps,
    tState
  > {
    override state: tState = { routines: [], search: '' };
    private form: FormInstance;

    override async componentDidMount(): Promise<void> {
      await this.refresh();
    }

    override render() {
      return (
        <Layout>
          <Layout.Content style={{ padding: '16px' }}>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link to="/routines">Routines</Link>
              </Breadcrumb.Item>
            </Breadcrumb>
            <Card
              style={{ margin: '16px 0 0 0' }}
              title={
                <Input
                  value={this.state.search}
                  style={{ width: '50%' }}
                  placeholder="Filter routines"
                  onChange={({ target }) => this.updateSearch(target.value)}
                />
              }
              extra={
                <Popconfirm
                  icon={
                    <QuestionCircleOutlined style={{ visibility: 'hidden' }} />
                  }
                  onConfirm={this.validate.bind(this)}
                  title={
                    <Form
                      onFinish={this.validate.bind(this)}
                      ref={form => (this.form = form)}
                    >
                      <Form.Item
                        label="Friendly Name"
                        name="friendlyName"
                        rules={[{ required: true }]}
                      >
                        <Input />
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
              <List
                dataSource={this.state.routines}
                pagination={{ pageSize: 10 }}
                renderItem={this.renderRoutine.bind(this)}
              />
            </Card>
          </Layout.Content>
        </Layout>
      );
    }

    private async activateRoutine(routine: RoutineDTO): Promise<void> {
      await sendRequest(`/routine/${routine._id}`, { method: 'post' });
    }

    private async deleteRoutine(routine: RoutineDTO): Promise<void> {
      await sendRequest(`/routine/${routine._id}`, { method: 'delete' });
      await this.refresh();
    }

    private async refresh(text?: string): Promise<void> {
      const search = is.empty(text) ? '' : `&friendlyName__regex=${text}`;
      const routines = await sendRequest<RoutineDTO[]>(
        `/routine?sort=friendlyName${search}`,
      );
      this.setState({ routines });
    }

    private renderRoutine(routine: RoutineDTO) {
      return (
        <List.Item key={routine._id}>
          <List.Item.Meta
            title={
              <Tooltip
                title={
                  <>
                    <Typography.Text
                      copyable={{
                        text: sendRequest.url(`/routine/${routine._id}`),
                      }}
                    >
                      Manual Activation URL
                    </Typography.Text>
                    <Button
                      type="primary"
                      onClick={() => this.activateRoutine(routine)}
                    >
                      Activate
                    </Button>
                  </>
                }
              >
                <Link to={`/routine/${routine._id}`}>
                  {routine.friendlyName}
                </Link>
              </Tooltip>
            }
          />
          <Popconfirm
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            title={`Are you sure you want to delete ${routine.friendlyName}?`}
            onConfirm={() => this.deleteRoutine(routine)}
          >
            <Button danger type="text">
              <CloseOutlined />
            </Button>
          </Popconfirm>
        </List.Item>
      );
    }

    private async updateSearch(search: string) {
      this.setState({ search });
      await this.refresh(search.toLowerCase());
    }

    private async validate(): Promise<void> {
      try {
        const values = await this.form.validateFields();
        const routine = await sendRequest<RoutineDTO>(`/routine`, {
          body: JSON.stringify(values),
          method: 'post',
        });
        this.form.resetFields();
        this.props.history.push(`/routine/${routine._id}`);
      } catch (error) {
        console.error(error);
      }
    }
  },
);
