import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type {
  GroupDTO,
  GroupSaveStateDTO,
} from '@automagical/controller-shared';
import { DOWN, is, UP } from '@automagical/utilities';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Layout,
  List,
  Popconfirm,
  Row,
  Tooltip,
  Typography,
} from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { sendRequest } from '../../types';
import { GroupCreateButton } from './GroupCreateButton';

const { Content } = Layout;

export class GroupList extends React.Component {
  override state: { groups: GroupDTO[] } = {
    groups: [],
  };

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    return (
      <Layout>
        <Content style={{ padding: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/groups">Groups</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <Row style={{ margin: '16px 0 0 0' }} gutter={16}>
            <Col span={12}>
              <Card
                title="Light Groups"
                extra={
                  <GroupCreateButton
                    type="light"
                    groupsUpdated={this.refresh.bind(this)}
                  />
                }
              >
                <List
                  dataSource={this.filter('light')}
                  pagination={{ pageSize: 10 }}
                  renderItem={this.renderGroup.bind(this)}
                ></List>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="Switch Groups"
                extra={
                  <GroupCreateButton
                    type="switch"
                    groupsUpdated={this.refresh.bind(this)}
                  />
                }
              >
                <List
                  dataSource={this.filter('switch')}
                  pagination={{ pageSize: 10 }}
                  renderItem={this.renderGroup.bind(this)}
                ></List>
              </Card>
            </Col>
          </Row>
          <Row style={{ margin: '16px 0 0 0' }} gutter={16}>
            <Col span={12}>
              <Card
                title="Fan Groups"
                extra={
                  <GroupCreateButton
                    type="fan"
                    groupsUpdated={this.refresh.bind(this)}
                  />
                }
              >
                <List
                  dataSource={this.filter('fan')}
                  pagination={{ pageSize: 10 }}
                  renderItem={this.renderGroup.bind(this)}
                ></List>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title="Lock Groups"
                extra={
                  <GroupCreateButton
                    type="lock"
                    groupsUpdated={this.refresh.bind(this)}
                  />
                }
              >
                <List
                  dataSource={this.filter('lock')}
                  pagination={{ pageSize: 10 }}
                  renderItem={this.renderGroup.bind(this)}
                ></List>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }

  private async activateState(
    group: GroupDTO,
    state: GroupSaveStateDTO,
  ): Promise<void> {
    await sendRequest(`/group/${group._id}/state/${state.id}`, {
      method: 'post',
    });
  }

  private async deleteGroup(group: GroupDTO): Promise<void> {
    await sendRequest(`/group/${group._id}`, { method: 'delete' });
    await this.refresh();
  }

  private filter(type: string): GroupDTO[] {
    return this.state.groups.filter(group => group.type === type);
  }

  private async refresh(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>(`/group?sort=friendlyName`);
    this.setState({ groups });
  }

  private renderGroup(group: GroupDTO) {
    return (
      <List.Item key={group._id}>
        <List.Item.Meta
          title={
            <Tooltip
              title={
                is.empty(group.save_states) ? (
                  <Empty description="No save states" />
                ) : (
                  <>
                    <Typography.Title level={4} style={{ minWidth: '250px' }}>
                      Save States
                    </Typography.Title>
                    <List
                      dataSource={group.save_states.sort((a, b) =>
                        a.friendlyName > b.friendlyName ? UP : DOWN,
                      )}
                      renderItem={item => (
                        <List.Item style={{ padding: '4px 8px' }}>
                          <Button
                            type="primary"
                            onClick={() => this.activateState(group, item)}
                          >
                            {item.friendlyName}
                          </Button>
                        </List.Item>
                      )}
                    />
                  </>
                )
              }
            >
              <Link to={`/group/${group._id}`}>{group.friendlyName}</Link>
            </Tooltip>
          }
        />
        <Popconfirm
          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          title={`Are you sure you want to delete ${group.friendlyName}?`}
          onConfirm={() => this.deleteGroup(group)}
        >
          <Button danger type="text">
            <CloseOutlined />
          </Button>
        </Popconfirm>
      </List.Item>
    );
  }
}
