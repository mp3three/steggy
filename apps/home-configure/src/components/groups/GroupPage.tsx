import type { GROUP_TYPES, GroupDTO } from '@steggy/controller-shared';
import { NOT_FOUND } from '@steggy/utilities';
import { Button, Card, Col, Layout, List, Row, Tabs } from 'antd';
import React from 'react';

import { GROUP_DESCRIPTIONS, sendRequest } from '../../types';
import { GroupCreateButton } from './GroupCreateButton';
import { GroupListDetail } from './GroupListDetail';

const { Content } = Layout;
type tState = {
  group: GroupDTO;
  groups: GroupDTO[];
};

export class GroupPage extends React.Component {
  override state = {
    group: undefined,
    groups: [],
  } as tState;

  private lastTab: `${GROUP_TYPES}` = 'light';

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    return (
      <Layout>
        <Content style={{ padding: '16px' }}>
          <Row gutter={8}>
            <Col span={12}>
              <Tabs
                type="card"
                onTabClick={tab => this.tabChange(tab as GROUP_TYPES)}
              >
                <Tabs.TabPane
                  key="light"
                  tab={`Light Groups (${this.filter('light').length})`}
                >
                  <Card
                    type="inner"
                    extra={
                      <GroupCreateButton
                        type="light"
                        onUpdate={group => this.refresh(group)}
                      />
                    }
                  >
                    <List
                      dataSource={this.filter('light')}
                      pagination={{ size: 'small' }}
                      renderItem={item => this.renderGroup(item)}
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
                        onUpdate={group => this.refresh(group)}
                      />
                    }
                  >
                    <List
                      dataSource={this.filter('switch')}
                      pagination={{ size: 'small' }}
                      renderItem={item => this.renderGroup(item)}
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
                        onUpdate={group => this.refresh(group)}
                      />
                    }
                  >
                    <List
                      dataSource={this.filter('fan')}
                      pagination={{ size: 'small' }}
                      renderItem={item => this.renderGroup(item)}
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
                        onUpdate={group => this.refresh(group)}
                      />
                    }
                  >
                    <List
                      dataSource={this.filter('lock')}
                      pagination={{ size: 'small' }}
                      renderItem={item => this.renderGroup(item)}
                    ></List>
                  </Card>
                </Tabs.TabPane>
              </Tabs>
            </Col>
            <Col span={12}>
              <GroupListDetail
                description={GROUP_DESCRIPTIONS.get(this.lastTab)}
                group={this.state.group}
                onClone={group => this.onClone(group)}
                onUpdate={group => this.refresh(group)}
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    );
  }
  private filter(type: string): GroupDTO[] {
    return this.state.groups.filter(group => group.type === type);
  }

  private onClone(group: GroupDTO): void {
    this.setState({
      group,
      groups: [...this.state.groups, group],
    });
  }

  private async refresh(group?: GroupDTO): Promise<void> {
    if (group) {
      const index = this.state.groups.findIndex(({ _id }) => _id === group._id);
      if (index === NOT_FOUND) {
        this.setState({
          group,
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
    this.setState({ group: undefined, groups });
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

  private tabChange(type: GROUP_TYPES): void {
    if (this.lastTab === type) {
      return;
    }
    this.lastTab = type;
    this.setState({ group: undefined });
  }
}
