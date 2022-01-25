import { GroupDTO, RoomDTO } from '@text-based/controller-shared';
import { Breadcrumb, Layout, notification, Spin, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';

type tStateType = {
  // color: string;
  name: string;
  room: RoomDTO;
};

export const RoomDetail = withRouter(
  class extends React.Component<
    { id: string } & RouteComponentProps<{ id: string }>,
    tStateType
  > {
    static propTypes = {
      id: PropTypes.string,
    };

    override async componentDidMount(): Promise<void> {
      await this.refresh();
    }

    override render() {
      return (
        <Layout style={{ height: '100%' }}>
          {this.state?.room ? (
            <Layout.Content style={{ margin: '16px' }}>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Link to={`/rooms`}>Rooms</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Link to={`/room/${this.state.room._id}`}>
                    <Typography.Text
                      editable={{ onChange: name => this.nameUpdate(name) }}
                    >
                      {this.state.name}
                    </Typography.Text>
                  </Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Layout.Content>
          ) : (
            <Layout.Content>
              <Spin size="large" tip="Loading..." />
            </Layout.Content>
          )}
        </Layout>
      );
    }

    private async addEntities(entities: string[]): Promise<void> {
      // const { group } = this.state as { group: GroupDTO };
      // group.entities = is.unique([...group.entities, ...entities]);
      // this.setState({
      //   group: await sendRequest(`/group/${group._id}`, {
      //     body: JSON.stringify({
      //       entities: group.entities,
      //     } as Partial<GroupDTO>),
      //     method: 'put',
      //   }),
      // });
    }

    private async deleteGroup(): Promise<void> {
      await sendRequest(`/room/${this.state.room._id}`, {
        method: 'delete',
      });
      notification.info({
        message: `Deleted ${this.state.name}`,
      });
      this.props.history.push('/rooms');
    }

    private groupRendering() {
      // if (this.state.room.type === 'switch') {
      //   return (
      //     <SwitchGroup
      //       group={this.state.room}
      //       groupUpdate={this.refresh.bind(this)}
      //     />
      //   );
      // }
      // return (
      //   <LightGroup
      //     group={this.state.room}
      //     groupUpdate={this.refresh.bind(this)}
      //   />
      // );
    }

    private async nameUpdate(name: string): Promise<void> {
      if (name === this.state.room.friendlyName) {
        return;
      }
      await sendRequest<GroupDTO>(`/room/${this.state.room._id}`, {
        body: JSON.stringify({
          friendlyName: name,
        }),
        method: 'put',
      });
      this.state.room.friendlyName = name;
      this.setState({ name });
    }

    private async onUpdate({ _id, ...group }: GroupDTO): Promise<void> {
      await sendRequest<GroupDTO>(`/group/${_id}`, {
        body: JSON.stringify(group),
        method: 'put',
      });
      await this.refresh();
    }

    private async refresh(room?: RoomDTO): Promise<void> {
      const { id } = this.props.match.params;
      // cheating refresh
      room ??= await sendRequest<RoomDTO>(`/room/${id}`);
      this.setState({ name: room.friendlyName, room });
    }
  },
);
