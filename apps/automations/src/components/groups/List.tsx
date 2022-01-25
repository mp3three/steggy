import type { GroupDTO } from '@text-based/controller-shared';
import { DOWN, UP } from '@text-based/utilities';
import { Breadcrumb, Card, Col, Layout, List, Row } from 'antd';
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
          <Row style={{ margin: '16px 0 0 0' }}>
            <Col span={10} offset={1}>
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
            <Col span={10} offset={2}>
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
          <Row style={{ margin: '16px 0 0 0' }}>
            <Col span={10} offset={1}>
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
            <Col span={10} offset={2}>
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

  private async refresh(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>(`/group`);
    this.setState({ groups });
  }

  private renderGroup(item: GroupDTO) {
    return (
      <List.Item key={item._id}>
        <Link to={`/group/${item._id}`}>{item.friendlyName}</Link>
      </List.Item>
    );
  }

  private sort(type: string): GroupDTO[] {
    return this.state.groups
      .filter(group => group.type === type)
      .sort((a, b) => (a.friendlyName > b.friendlyName ? UP : DOWN));
  }
}
