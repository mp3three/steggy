import { EditOutlined } from '@ant-design/icons';
import {
  GroupDTO,
  GroupSaveStateDTO,
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomStateDTO,
} from '@text-based/controller-shared';
import {
  ColorModes,
  LightAttributesDTO,
} from '@text-based/home-assistant-shared';
import { DOWN, is, UP } from '@text-based/utilities';
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
import { LightEntityCard, SwitchEntityCard } from '../../entities';
type tState = {
  dirty?: boolean;
  drawer?: boolean;
  friendlyName?: string;
  groupStates?: Record<string, string>;
  groups?: GroupDTO[];
};

export class RoomStateEdit extends React.Component<
  {
    onUpdate: (group: RoomDTO) => void;
    room: RoomDTO;
    state: RoomStateDTO;
  },
  tState
> {
  override state: tState = {
    groupStates: {},
    groups: [],
  };

  private cards: (LightEntityCard | SwitchEntityCard)[];

  private get room() {
    return this.props.room;
  }

  private get entities(): string[] {
    return this.props.room.entities
      .map(({ entity_id }) => entity_id)
      .filter(i => ['switch', 'light'].includes(domain(i)));
  }

  private get groups() {
    return this.state?.groups;
  }

  override componentDidMount(): void {
    this.setState({ friendlyName: this.props.state.friendlyName });
    if (!is.empty(this.props.room.groups)) {
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
  }

  override render() {
    this.cards = [];
    return this.props.room ? (
      <>
        <Button
          size="small"
          type="text"
          onClick={() => this.setState({ drawer: true })}
        >
          <EditOutlined />
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
              <Button type="primary" onClick={this.onSave.bind(this)}>
                Save
              </Button>
              <Button onClick={() => this.onClose(false)}>Cancel</Button>
            </Space>
          }
        >
          <Space direction="vertical">
            {is.empty(this.entities) ? undefined : (
              <>
                <Typography.Title level={3}>Entites</Typography.Title>
                <Space wrap>
                  {this.entities.map(entity => this.entityRender(entity))}
                </Space>
              </>
            )}
            {is.empty(this.entities) || is.empty(this.groups) ? undefined : (
              <Divider />
            )}
            {is.empty(this.groups) ? undefined : (
              <>
                <Typography.Title level={3}>Groups</Typography.Title>
                <Table dataSource={this.groups}>
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
                            <Select.Option value={item.id}>
                              {item.friendlyName}
                            </Select.Option>
                          ))}
                      </Select>
                    )}
                  />
                </Table>
              </>
            )}
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
        return (
          <SwitchEntityCard
            ref={i => this.cards.push(i)}
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
            ref={i => this.cards.push(i)}
            key={entity}
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
    const room = await sendRequest<RoomDTO>(
      `/room/${this.room._id}/state/${id}`,
      {
        body: JSON.stringify({
          friendlyName: this.state.friendlyName,
          id,
          states: [
            ...this.cards
              .filter(i => !!i)
              .map(i => {
                const state = i.getSaveState();
                if (!state) {
                  return undefined;
                }
                return { ...state, type: 'entity' };
              })
              .filter(i => !is.undefined(i)),
            ...Object.keys(groupStates)
              .filter(key => groupStates[key] !== 'none')
              .map(
                group =>
                  ({
                    ref: group,
                    state: groupStates[group],
                    type: 'group',
                  } as RoomEntitySaveStateDTO),
              ),
          ],
        } as RoomStateDTO),
        method: 'put',
      },
    );
    this.setState({ dirty: false, drawer: false });
    this.props.onUpdate(room);
  }

  private onSwitchStateChanged(state: RoomEntitySaveStateDTO): void {
    this.cards.forEach(i =>
      (i as SwitchEntityCard)?.setState({
        state: state.state,
      }),
    );
  }

  private async refreshGroups(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>(
      `/room/${this.room._id}/group-save-states`,
    );
    this.setState({ groups });
  }
}
