import { List, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { Link, useParams, withRouter } from 'react-router-dom';

import { DOWN, GroupDTO, is, sendRequest, TitleCase, UP } from '../../types';

const { Title } = Typography;

class GroupDetailComponent extends React.Component {
  override state: { groups: GroupDTO[] } = {
    groups: [],
  };

  override async componentDidMount(): Promise<void> {
    const { id } = useParams<{ id: string }>();
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
export const GroupDetail = withRouter(GroupDetailComponent);
