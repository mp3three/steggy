import {
  GeneralSaveStateDTO,
  GroupDTO,
  PersonDTO,
  RoomDTO,
  RoomStateDTO,
} from '@steggy/controller-shared';
import { DOWN, is, UP } from '@steggy/utilities';
import {
  Button,
  Divider,
  Drawer,
  Layout,
  notification,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from 'antd';
import React from 'react';

import { domain, sendRequest } from '../../../types';
import {
  FanEntityCard,
  LightEntityCard,
  SwitchEntityCard,
} from '../../entities';

type tState = {
  dirty?: boolean;
  drawer?: boolean;
  friendlyName?: string;
  groupStates?: Record<string, string>;
  groups?: GroupDTO[];
  roomStates?: Record<string, string>;
  rooms?: RoomDTO[];
};

export class RoomStateEdit extends React.Component<
  {
    onUpdate?: (group: RoomDTO) => void;
    person?: PersonDTO;
    room?: RoomDTO;
    state: RoomStateDTO;
  },
  tState
> {
  override state: tState = {
    groupStates: {},
    groups: [],
    roomStates: {},
    rooms: [],
  };

  private cards: (LightEntityCard | SwitchEntityCard | typeof FanEntityCard)[];

  private get room() {
    return this.props.room ?? this.props.person;
  }

  private get routeBase() {
    if (this.props.person) {
      return `person`;
    }
    return `room`;
  }

  private get entities(): string[] {
    return this.room.entities
      .map(({ entity_id }) => entity_id)
      .filter(i =>
        ['switch', 'light', 'fan', 'media_player'].includes(domain(i)),
      );
  }

  private get groups() {
    return this.state?.groups;
  }

  private get rooms() {
    return this.state?.rooms;
  }

  override componentDidMount(): void {
    this.setState({ friendlyName: this.props.state.friendlyName });
    if (!is.empty(this.room.groups)) {
      this.refreshGroups();
      const groupStates: Record<string, string> = {};
      this.props.state.states ??= [];
      this.props.state.states.forEach(state => {
        if (state.type !== 'group') {
          return;
        }
        groupStates[state.ref] = state.state;
      });
      this.setState({ groupStates });
    }

    if (!is.empty(this.props?.person?.rooms)) {
      this.refreshRooms();
      const roomStates: Record<string, string> = {};
      this.props.state.states ??= [];
      this.props.state.states.forEach(state => {
        if (state.type !== 'room') {
          return;
        }
        roomStates[state.ref] = state.state;
      });
      this.setState({ roomStates });
    }
  }

  // eslint-disable-next-line radar/cognitive-complexity
  override render() {
    this.cards = [];
    return this.room ? (
      <>
        <Button
          size="small"
          type="text"
          onClick={() => this.setState({ drawer: true })}
        >
          {this.state.friendlyName}
        </Button>
        <Drawer
          title={
            <Typography.Text
              editable={{
                onChange: friendlyName => this.setState({ friendlyName }),
              }}
            >
              {this.state?.friendlyName}
            </Typography.Text>
          }
          size="large"
          visible={this.state?.drawer}
          onClose={() => this.onClose(true)}
          extra={
            <Space>
              <Button type="primary" onClick={() => this.onSave()}>
                Save
              </Button>
              <Button onClick={() => this.onClose(false)}>Cancel</Button>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {is.empty(this.entities) ? undefined : (
              <>
                <Divider orientation="left">
                  <Typography.Title level={4}>Entities</Typography.Title>
                </Divider>
                <Space wrap>
                  {this.entities.map(entity => this.entityRender(entity))}
                </Space>
              </>
            )}
            {is.empty(this.groups) ? undefined : (
              <>
                <Divider orientation="left">
                  <Typography.Title level={4}>Groups</Typography.Title>
                </Divider>
                <Table
                  dataSource={this.groups.sort((a, b) =>
                    a.friendlyName > b.friendlyName ? UP : DOWN,
                  )}
                  style={{ width: '100%' }}
                >
                  <Table.Column
                    title="Group Name"
                    key="friendlyName"
                    dataIndex="friendlyName"
                  />
                  <Table.Column
                    title="Group State"
                    render={(text, record: GroupDTO) => (
                      <Select
                        key={record._id}
                        value={this.groupState(record._id)}
                        onChange={value => this.groupChange(record._id, value)}
                        defaultActiveFirstOption
                        style={{ width: '100%' }}
                      >
                        <Select.Option value="none">
                          <Typography.Text type="secondary">
                            No change
                          </Typography.Text>
                        </Select.Option>
                        {record.save_states
                          .sort((a, b) =>
                            a.friendlyName > b.friendlyName ? UP : DOWN,
                          )
                          .map(item => (
                            <Select.Option value={item.id} key={item.id}>
                              {item.friendlyName}
                            </Select.Option>
                          ))}
                      </Select>
                    )}
                  />
                </Table>
              </>
            )}
            {is.empty(this.rooms) ? undefined : (
              <>
                <Divider orientation="left">
                  <Typography.Title level={4}>Rooms</Typography.Title>
                </Divider>
                <Table
                  dataSource={this.rooms.sort((a, b) =>
                    a.friendlyName > b.friendlyName ? UP : DOWN,
                  )}
                  style={{ width: '100%' }}
                >
                  <Table.Column
                    title="Room Name"
                    key="friendlyName"
                    dataIndex="friendlyName"
                  />
                  <Table.Column
                    title="Room State"
                    render={(text, record: RoomDTO) => (
                      <Select
                        key={record._id}
                        value={this.roomState(record._id)}
                        onChange={value => this.roomChange(record._id, value)}
                        defaultActiveFirstOption
                        style={{ width: '100%' }}
                      >
                        <Select.Option value="none">
                          <Typography.Text type="secondary">
                            No change
                          </Typography.Text>
                        </Select.Option>
                        {record.save_states
                          .sort((a, b) =>
                            a.friendlyName > b.friendlyName ? UP : DOWN,
                          )
                          // eslint-disable-next-line radar/no-identical-functions
                          .map(item => (
                            <Select.Option value={item.id} key={item.id}>
                              {item.friendlyName}
                            </Select.Option>
                          ))}
                      </Select>
                    )}
                  />
                </Table>
              </>
            )}
            <Divider orientation="left">
              <Typography.Title level={4}>Identifiers</Typography.Title>
            </Divider>
            <Typography.Title level={5}>Room ID</Typography.Title>
            <Typography.Text code>{this.room._id}</Typography.Text>
            <Typography.Title level={5}>State ID</Typography.Title>
            <Typography.Text code>{this.props.state.id}</Typography.Text>
          </Space>
        </Drawer>
      </>
    ) : (
      <Layout.Content>
        <Spin size="large" tip="Loading..." />
      </Layout.Content>
    );
  }

  private entityRender(entity: string) {
    const state = this.props?.state?.states?.find(
      ({ ref }) => ref === entity,
    ) || {
      extra: {},
      ref: entity,
      state: undefined,
    };
    switch (domain(entity)) {
      case 'switch':
      case 'media_player':
        return (
          <SwitchEntityCard
            // ref={i => this.cards.push(i)}
            key={entity}
            state={state}
            stateOnly
            optional
            onUpdate={this.entityUpdate.bind(this)}
          />
        );
      case 'light':
        return (
          <LightEntityCard
            // ref={i => this.cards.push(i)}
            key={entity}
            optional
            state={state}
            onUpdate={this.entityUpdate.bind(this)}
          />
        );
      case 'fan':
        return (
          <FanEntityCard
            // ref={(i:FanEntityCard) => this.cards.push(i )}
            key={entity}
            optional
            state={state}
            onUpdate={this.entityUpdate.bind(this)}
          />
        );
    }
    return undefined;
  }

  private entityUpdate(): void {
    this.setState({ dirty: true });
  }

  private groupChange(group: string, value: string): void {
    const { groupStates } = this.state;
    this.setState({
      groupStates: {
        ...groupStates,
        [group]: value,
      },
    });
  }

  private groupState(group: string): string {
    return this.state.groupStates[group] ?? 'none';
  }

  private onClose(warn: boolean): void {
    if (this.state.dirty && warn) {
      notification.warn({
        description: `Changes to ${this.props.state.friendlyName} were not saved`,
        message: 'Unsaved changes',
      });
    }
    this.setState({ drawer: false });
  }

  private async onSave(): Promise<void> {
    const id = this.props.state.id;
    const groupStates = this.state.groupStates;
    const entityStates = this.cards
      // not falsy somehow
      .filter(i => !!i)
      .map(i => {
        // const state = i.getSaveState();
        // if (!state) {
        return undefined;
        // }
        // return { ...state, type: 'entity' };
      })
      .filter(i => !is.undefined(i));

    const room = await sendRequest<RoomDTO>({
      body: {
        friendlyName: this.state.friendlyName,
        id,
        states: [
          ...entityStates,
          ...Object.keys(groupStates)
            .filter(key => groupStates[key] !== 'none')
            .map(
              group =>
                ({
                  ref: group,
                  state: groupStates[group],
                  type: 'group',
                } as GeneralSaveStateDTO),
            ),
        ],
      } as RoomStateDTO,
      method: 'put',
      url: `/${this.routeBase}/${this.room._id}/state/${id}`,
    });
    this.setState({ dirty: false, drawer: false });
    if (this.props.onUpdate) {
      this.props.onUpdate(room);
    }
  }

  private async refreshGroups(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>({
      url: `/${this.routeBase}/${this.room._id}/group-save-states`,
    });
    this.setState({ groups });
  }

  private async refreshRooms(): Promise<void> {
    const rooms = await sendRequest<RoomDTO[]>({
      url: `/${this.routeBase}/${this.room._id}/room-save-states`,
    });
    this.setState({ rooms });
  }

  private roomChange(room: string, value: string): void {
    const { roomStates } = this.state;
    this.setState({
      roomStates: {
        ...roomStates,
        [room]: value,
      },
    });
  }

  private roomState(room: string): string {
    return this.state.roomStates[room] ?? 'none';
  }
}
