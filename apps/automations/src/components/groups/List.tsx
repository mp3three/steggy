import type { GroupDTO } from '@text-based/controller-shared';
import { DOWN, is, TitleCase, UP } from '@text-based/utilities';
import { Layout, List, Typography } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { sendRequest } from '../../types';
import { GroupListSidebar } from './ListSidebar';

const { Title } = Typography;
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
        <Content>
          <Title level={3}>Group List</Title>
          {this.sort().map(({ name, groups }) => (
            <List
              key={name}
              header={<Title level={4}>{TitleCase(name)} Groups</Title>}
              dataSource={groups}
              pagination={{ pageSize: 10 }}
              renderItem={item => (
                <List.Item key={item._id}>
                  <Link to={`/group/${item._id}`}>{item.friendlyName}</Link>
                </List.Item>
              )}
            ></List>
          ))}
        </Content>
        <GroupListSidebar groupsUpdated={this.refresh.bind(this)} />
      </Layout>
    );
  }
  private async refresh(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>(`/group`);
    this.setState({ groups });
  }

  private sort(): { groups: GroupDTO[]; name: string }[] {
    const types = is
      .unique(this.state.groups?.map(i => i.type))
      .sort((a, b) => (a > b ? UP : DOWN));
    return types.map(name => ({
      groups: this.state.groups.filter(({ type }) => type === name),
      name,
    }));
  }
}
