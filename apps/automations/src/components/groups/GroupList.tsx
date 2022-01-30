import { CloseOutlined } from '@ant-design/icons';
import type { GroupDTO } from '@text-based/controller-shared';
import { DOWN, UP } from '@text-based/utilities';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Layout,
  List,
  Popconfirm,
  Row,
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
      <Layout hasSider>
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
                  dataSource={this.sort('light')}
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
                  dataSource={this.sort('switch')}
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
                  dataSource={this.sort('fan')}
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
                  dataSource={this.sort('lock')}
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

  private async deleteGroup(group: GroupDTO): Promise<void> {
    await sendRequest(`/group/${group._id}`, { method: 'delete' });
    await this.refresh();
  }

  private async refresh(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>(`/group`);
    this.setState({ groups });
  }

  private renderGroup(group: GroupDTO) {
    return (
      <List.Item key={group._id}>
        <List.Item.Meta
          title={<Link to={`/group/${group._id}`}>{group.friendlyName}</Link>}
        />
        <Popconfirm
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

  private sort(type: string): GroupDTO[] {
    return this.state.groups
      .filter(group => group.type === type)
      .sort((a, b) => (a.friendlyName > b.friendlyName ? UP : DOWN));
  }
}
