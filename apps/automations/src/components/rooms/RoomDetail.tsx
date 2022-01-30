import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  GroupDTO,
  RoomDTO,
  RoomEntityDTO,
} from '@text-based/controller-shared';
import { TitleCase } from '@text-based/utilities';
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Layout,
  List,
  notification,
  Popconfirm,
  Popover,
  Row,
  Spin,
  Typography,
} from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { domain, sendRequest } from '../../types';
import { EntityDetailDrawer, EntityModalPicker } from '../entities';
import { GroupModalPicker } from '../groups';
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
              <Row gutter={16} style={{ margin: '16px 0 0 0' }}>
                <Col span={12}>
                  <Card
                    title="Entities"
                    extra={
                      <EntityModalPicker
                        onAdd={this.addEntities.bind(this)}
                        exclude={this.room.entities.map(
                          ({ entity_id }) => entity_id,
                        )}
                      />
                    }
                  >
                    <List
                      dataSource={this.room.entities}
                      renderItem={item => this.entityRender(item)}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    title="Groups"
                    extra={
                      <GroupModalPicker
                        exclude={this.room.groups}
                        onAdd={this.addGroups.bind(this)}
                      />
                    }
                  >
                    <List
                      dataSource={this.room.groups}
                      renderItem={item => this.groupRender(item)}
                    />
                  </Card>
                </Col>
              </Row>
              <Row gutter={16} style={{ margin: '16px 0 0 0' }}>
                <Col span={24}>
                  <RoomSaveStates
                    room={this.room}
                    roomUpdated={this.refresh.bind(this)}
                  />
                </Col>
              </Row>
            </Layout.Content>
          ) : (
            <Layout.Content>
              <Spin size="large" tip="Loading..." />
            </Layout.Content>
          )}
        </Layout>
      );
    }

    private async activateGroupState(group: string, state: string) {
      await sendRequest(`/group/${group}/state/${state}`, { method: 'post' });
    }

    private async addEntities(entities: string[]): Promise<void> {
      const room = this.room;
      room.entities = [
        ...room.entities,
        ...entities.map(entity_id => ({ entity_id })),
      ];
      this.setState({
        room: await sendRequest<RoomDTO>(`/room/${room._id}`, {
          body: JSON.stringify({
            entities: room.entities,
          } as Partial<RoomDTO>),
          method: 'put',
        }),
      });
    }

    private async addGroups(groups: string[]): Promise<void> {
      const room = this.room;
      room.groups = [...room.groups, ...groups];
      this.setState({
        room: await sendRequest<RoomDTO>(`/room/${room._id}`, {
          body: JSON.stringify({
            groups: room.groups,
          } as Partial<RoomDTO>),
          method: 'put',
        }),
      });
    }

    private async deleteRoom(): Promise<void> {
      await sendRequest(`/room/${this.state.room._id}`, {
        method: 'delete',
      });
      notification.info({
        message: `Deleted ${this.state.name}`,
      });
      this.props.history.push('/rooms');
    }

    private async detachGroup(group: string): Promise<void> {
      let room = this.room;
      room = await sendRequest(`/room/${room._id}`, {
        body: JSON.stringify({ groups: room.groups.filter(i => i !== group) }),
        method: 'put',
      });
      this.setState({ room });
    }

    private entityRender({ entity_id }: RoomEntityDTO) {
      const state = this.room.entityStates.find(i => i.entity_id === entity_id);
      return (
        <List.Item
          actions={[
            <Popconfirm
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              title="Are you sure you want to delete this?"
              onConfirm={() => this.removeEntity(entity_id)}
            >
              <Button danger type="text">
                X
              </Button>
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            description={`${TitleCase(domain(state.entity_id))} entity`}
            title={<EntityDetailDrawer entity={state} />}
          />
        </List.Item>
      );
    }

    private group(id: string): PartialGroup {
      return this.state.groups.find(({ _id }) => _id === id);
    }

    private groupRender(item: string) {
      const group = this.group(item);
      return (
        <List.Item
          key={item}
          actions={[
            <Popconfirm
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              title={`Detach group?`}
              onConfirm={() => this.detachGroup(item)}
            >
              <Button danger type="text">
                <CloseOutlined />
              </Button>
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            title={
              <Popover
                content={
                  <List
                    dataSource={group.save_states}
                    renderItem={state => (
                      <List.Item>
                        <Button
                          onClick={() =>
                            this.activateGroupState(group._id, state.id)
                          }
                        >
                          Activate {state.friendlyName}
                        </Button>
                      </List.Item>
                    )}
                  />
                }
                title="Save States"
              >
                <Link to={`/group/${item}`}>{group.friendlyName}</Link>
              </Popover>
            }
            description={`${TitleCase(group.type)} group`}
          />
        </List.Item>
      );
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

    private async onUpdate({ _id, ...rooom }: RoomDTO): Promise<void> {
      await sendRequest<RoomDTO>(`/group/${_id}`, {
        body: JSON.stringify(rooom),
        method: 'put',
      });
      await this.refresh();
    }

    private async refresh(room?: RoomDTO): Promise<void> {
      const { id } = this.props.match.params;
      // cheating refresh
      room ??= await sendRequest<RoomDTO>(`/room/${id}`);
      this.setState({
        groups: await sendRequest(
          `/group?select=friendlyName,type,save_states.friendlyName,save_states.id`,
        ),
        name: room.friendlyName,
        room,
      });
    }

    private async removeEntity(entity: string): Promise<void> {
      this.refresh(
        await sendRequest<RoomDTO>(`/room/${this.room._id}/entity/${entity}`, {
          method: 'delete',
        }),
      );
    }
  },
);
