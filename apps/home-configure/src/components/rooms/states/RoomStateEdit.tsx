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
import React, { useEffect, useState } from 'react';

import { domain, sendRequest } from '../../../types';
import {
  FanEntityCard,
  LightEntityCard,
  SwitchEntityCard,
} from '../../entities';
import { ItemPin } from '../../misc';

// eslint-disable-next-line radar/cognitive-complexity
export function RoomStateEdit(props: {
  onUpdate?: (group: RoomDTO) => void;
  person?: PersonDTO;
  room?: RoomDTO;
  state: RoomStateDTO;
}) {
  const [dirty, setDirty] = useState<boolean>();
  const [drawer, setDrawer] = useState<boolean>();
  const [friendlyName, setFriendlyName] = useState<string>(
    props.state.friendlyName,
  );
  const [groupStates, setGroupStates] = useState<Record<string, string>>();
  const [groups, setGroups] = useState<GroupDTO[]>([]);
  const [roomStates, setRoomStates] = useState<Record<string, string>>({});
  const [rooms, setRooms] = useState<RoomDTO[]>([]);

  const cards: (LightEntityCard | SwitchEntityCard | FanEntityCard)[] = [];

  const room = props.room ?? props.person;

  const routeBase = props.person ? `person` : `room`;

  const entities = room.entities
    .map(({ entity_id }) => entity_id)
    .filter(i =>
      ['switch', 'light', 'fan', 'media_player'].includes(domain(i)),
    );

  useEffect(() => {
    if (!is.empty(room.groups)) {
      refreshGroups();
      const groupStates: Record<string, string> = {};
      props.state.states ??= [];
      props.state.states.forEach(state => {
        if (state.type !== 'group') {
          return;
        }
        groupStates[state.ref] = state.state;
      });
      setGroupStates(groupStates);
    }

    if (!is.empty(props?.person?.rooms)) {
      refreshRooms();
      const roomStates: Record<string, string> = {};
      props.state.states ??= [];
      props.state.states.forEach(state => {
        if (state.type !== 'room') {
          return;
        }
        roomStates[state.ref] = state.state;
      });
      setGroupStates(roomStates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?._id]);

  function entityRender(entity: string) {
    const state = props?.state?.states?.find(({ ref }) => ref === entity) || {
      extra: {},
      ref: entity,
      state: undefined,
    };
    switch (domain(entity)) {
      case 'switch':
      case 'media_player':
        return (
          <SwitchEntityCard
            ref={i => cards.push(i)}
            key={entity}
            state={state}
            stateOnly
            optional
            onUpdate={() => setDirty(true)}
          />
        );
      case 'light':
        return (
          <LightEntityCard
            ref={i => cards.push(i)}
            key={entity}
            optional
            state={state}
            onUpdate={() => setDirty(true)}
          />
        );
      case 'fan':
        return (
          <FanEntityCard
            ref={i => cards.push(i)}
            key={entity}
            optional
            state={state}
            onUpdate={() => setDirty(true)}
          />
        );
    }
    return undefined;
  }

  function groupChange(group: string, value: string): void {
    setGroupStates({
      ...groupStates,
      [group]: value,
    });
  }

  function groupState(group: string): string {
    return groupStates[group] ?? 'none';
  }

  function onClose(warn: boolean): void {
    if (dirty && warn) {
      notification.warn({
        description: `Changes to ${props.state.friendlyName} were not saved`,
        message: 'Unsaved changes',
      });
    }
    setDrawer(false);
  }

  async function onSave(): Promise<void> {
    const id = props.state.id;
    const entityStates = cards
      // not falsy somehow
      .filter(i => !!i)
      .map(i => {
        const state = i.getSaveState();
        if (!state) {
          return undefined;
        }
        return { ...state, type: 'entity' };
      })
      .filter(i => !is.undefined(i));

    const item = await sendRequest<RoomDTO>({
      body: {
        friendlyName: friendlyName,
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
      url: `/${routeBase}/${room?._id}/state/${id}`,
    });
    setDirty(false);
    setDrawer(false);
    if (props.onUpdate) {
      props.onUpdate(item);
    }
  }

  async function refreshGroups(): Promise<void> {
    const groups = await sendRequest<GroupDTO[]>({
      url: `/${routeBase}/${room?._id}/group-save-states`,
    });
    setGroups(groups);
  }

  async function refreshRooms(): Promise<void> {
    const rooms = await sendRequest<RoomDTO[]>({
      url: `/${routeBase}/${room?._id}/room-save-states`,
    });
    setRooms(rooms);
  }

  function roomChange(room: string, value: string): void {
    setRoomStates({
      ...roomStates,
      [room]: value,
    });
  }

  function roomState(room: string): string {
    return roomStates[room] ?? 'none';
  }

  return room ? (
    <>
      <Button size="small" type="text" onClick={() => setDrawer(true)}>
        {friendlyName}
      </Button>
      <Drawer
        title={
          <Typography.Text
            editable={{
              onChange: friendlyName => setFriendlyName(friendlyName),
            }}
          >
            {friendlyName}
          </Typography.Text>
        }
        size="large"
        visible={drawer}
        onClose={() => onClose(true)}
        extra={
          <Space>
            <ItemPin type={routeBase} target={room?._id} />
            <Button type="primary" onClick={() => onSave()}>
              Save
            </Button>
            <Button onClick={() => onClose(false)}>Cancel</Button>
          </Space>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {is.empty(entities) ? undefined : (
            <>
              <Divider orientation="left">
                <Typography.Title level={4}>Entities</Typography.Title>
              </Divider>
              <Space wrap>{entities.map(entity => entityRender(entity))}</Space>
            </>
          )}
          {is.empty(groups) ? undefined : (
            <>
              <Divider orientation="left">
                <Typography.Title level={4}>Groups</Typography.Title>
              </Divider>
              <Table
                dataSource={groups.sort((a, b) =>
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
                      value={groupState(record._id)}
                      onChange={value => groupChange(record._id, value)}
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
          {is.empty(rooms) ? undefined : (
            <>
              <Divider orientation="left">
                <Typography.Title level={4}>Rooms</Typography.Title>
              </Divider>
              <Table
                dataSource={rooms.sort((a, b) =>
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
                      value={roomState(record._id)}
                      onChange={value => roomChange(record._id, value)}
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
          <Typography.Text code>{room?._id}</Typography.Text>
          <Typography.Title level={5}>State ID</Typography.Title>
          <Typography.Text code>{props.state.id}</Typography.Text>
        </Space>
      </Drawer>
    </>
  ) : (
    <Layout.Content>
      <Spin size="large" tip="Loading..." />
    </Layout.Content>
  );
}
