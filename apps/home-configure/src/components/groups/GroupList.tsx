import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { GroupDTO } from '@steggy/controller-shared';
import { NOT_FOUND } from '@steggy/utilities';
import { Button, Card, Col, Layout, List, Popconfirm, Row, Tabs } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { GroupCreateButton } from './GroupCreateButton';
import { GroupListDetail } from './GroupListDetail';

const { Content } = Layout;

export class GroupList extends React.Component {
  override state: { group: GroupDTO; groups: GroupDTO[] } = {
    group: undefined,
    groups: [],
  };

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    return (
      <Layout>
        <Content style={{ padding: '16px' }}>
          <Row gutter={8}>
            <Col span={12}>
              <Tabs type="card">
                <Tabs.TabPane
                  key="light"
                  tab={`Light Groups (${this.filter('light').length})`}
                >
                  <Card
                    type="inner"
                    extra={
                      <GroupCreateButton
                        type="light"
                        onUpdate={this.refresh.bind(this)}
                      />
                    }
                  >
                    <List
                      dataSource={this.filter('light')}
                      pagination={{ size: 'small' }}
                      renderItem={this.renderGroup.bind(this)}
                    ></List>
                  </Card>
                </Tabs.TabPane>
                <Tabs.TabPane
                  key="switch"
                  tab={`Switch Groups (${this.filter('switch').length})`}
                >
                  <Card
                    type="inner"
                    extra={
                      <GroupCreateButton
                        type="switch"
                        onUpdate={this.refresh.bind(this)}
                      />
                    }
                  >
                    <List
                      dataSource={this.filter('switch')}
                      pagination={{ size: 'small' }}
                      renderItem={this.renderGroup.bind(this)}
                    ></List>
                  </Card>
                </Tabs.TabPane>
                <Tabs.TabPane
                  key="fan"
                  tab={`Fan Groups (${this.filter('fan').length})`}
                >
                  <Card
                    type="inner"
                    extra={
                      <GroupCreateButton
                        type="fan"
                        onUpdate={this.refresh.bind(this)}
                      />
                    }
                  >
                    <List
                      dataSource={this.filter('fan')}
                      pagination={{ size: 'small' }}
                      renderItem={this.renderGroup.bind(this)}
                    ></List>
                  </Card>
                </Tabs.TabPane>
                <Tabs.TabPane
                  key="lock"
                  tab={`Lock Groups (${this.filter('lock').length})`}
                >
                  <Card
                    type="inner"
                    extra={
                      <GroupCreateButton
                        type="lock"
                        onUpdate={this.refresh.bind(this)}
                      />
                    }
                  >
                    <List
                      dataSource={this.filter('lock')}
                      pagination={{ size: 'small' }}
                      renderItem={this.renderGroup.bind(this)}
                    ></List>
                  </Card>
                </Tabs.TabPane>
              </Tabs>
            </Col>
            <Col span={12}>
              <GroupListDetail
                group={this.state.group}
                onUpdate={this.refresh.bind(this)}
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }

  private async deleteGroup(group: GroupDTO): Promise<void> {
    await sendRequest({
      method: 'delete',
      url: `/group/${group._id}`,
    });
    await this.refresh();
  }

  private filter(type: string): GroupDTO[] {
    return this.state.groups.filter(group => group.type === type);
  }

  private async refresh(group?: GroupDTO): Promise<void> {
    if (group) {
      const index = this.state.groups.findIndex(({ _id }) => _id === group._id);
      if (index === NOT_FOUND) {
        this.setState({
          groups: [...this.state.groups, group],
        });
        return;
      }
      this.setState({
        group,
        groups: this.state.groups.map(item =>
          item._id === group._id ? group : item,
        ),
      });
      return;
    }
    const groups = await sendRequest<GroupDTO[]>({
      control: {
        sort: ['friendlyName'],
      },
      url: `/group`,
    });
    this.setState({ groups });
  }

  private renderGroup(group: GroupDTO) {
    return (
      <List.Item key={group._id}>
        <List.Item.Meta
          title={
            <Button
              type={this.state?.group?._id === group._id ? 'primary' : 'text'}
              onClick={() => this.setGroup(group)}
            >
              {group.friendlyName}
            </Button>
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

  private async setGroup(group: GroupDTO): Promise<void> {
    this.setState({
      group: await sendRequest({
        url: `/group/${group._id}`,
      }),
    });
  }
}
