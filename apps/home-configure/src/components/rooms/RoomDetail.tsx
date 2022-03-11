import { GroupDTO, RoomDTO } from '@automagical/controller-shared';
import { Breadcrumb, Layout, Spin, Tabs, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { sendRequest } from '../../types';
import { RoomConfiguration } from './RoomConfiguration';
import { RoomMetadata } from './RoomMetadata';
import { RoomSaveStates } from './RoomSaveState';

type PartialGroup = Pick<
  GroupDTO,
  '_id' | 'friendlyName' | 'type' | 'save_states'
>;
type tStateType = {
  groups: PartialGroup[];
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

    private get room(): RoomDTO {
      return this.state.room;
    }

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
              <Tabs>
                <Tabs.TabPane tab="Configuration" key="configuration">
                  <RoomConfiguration
                    room={this.state.room}
                    onUpdate={room => this.refresh(room)}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Save States" key="save_states">
                  <RoomSaveStates
                    room={this.room}
                    roomUpdated={this.refresh.bind(this)}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Metadata" key="metadata">
                  <RoomMetadata
                    room={this.state.room}
                    onUpdate={room => this.refresh(room)}
                  />
                </Tabs.TabPane>
              </Tabs>
            </Layout.Content>
          ) : (
            <Layout.Content>
              <Spin size="large" tip="Loading..." />
            </Layout.Content>
          )}
        </Layout>
      );
    }

    private async nameUpdate(name: string): Promise<void> {
      if (name === this.state.room.friendlyName) {
        return;
      }
      await sendRequest<GroupDTO>({
        body: {
          friendlyName: name,
        },
        method: 'put',
        url: `/room/${this.state.room._id}`,
      });
      this.state.room.friendlyName = name;
      this.setState({ name });
    }

    private async refresh(room?: RoomDTO): Promise<void> {
      const { id } = this.props.match.params;
      // cheating refresh
      room ??= await sendRequest<RoomDTO>({ url: `/room/${id}` });
      this.setState({
        name: room.friendlyName,
        room,
      });
    }
  },
);
