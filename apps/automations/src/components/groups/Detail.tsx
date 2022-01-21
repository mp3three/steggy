import { GroupDTO } from '@text-based/controller-shared';
import { DOWN, is, TitleCase, UP } from '@text-based/utilities';
import { List, Typography } from 'antd';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';

const { Title } = Typography;

export class GroupDetail extends React.Component {
  override state: { groups: GroupDTO[] } = {
    groups: [],
  };

  override async componentDidMount(): Promise<void> {
    // const { id } = useParams<{ id: string }>();
    const id = '1';
    const groups = await sendRequest<GroupDTO[]>(`/group/${id}`);
    this.setState({ groups });
  }

  override render() {
    return (
      <>
        <Title level={3}>Group List</Title>
        {this.sort().map(({ name, groups }) => (
          <List
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
      </>
    );
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
// export const GroupDetail = withRouter(GroupDetailComponent);
