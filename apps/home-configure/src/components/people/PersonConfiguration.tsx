import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  GroupDTO,
  PersonDTO,
  RoomDTO,
  RoomEntityDTO,
} from '@steggy/controller-shared';
import { DOWN, is, TitleCase, UP } from '@steggy/utilities';
import { Button, Card, List, Popconfirm, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { EntityModalPicker } from '../entities';
import { EntityInspectButton } from '../entities/InspectButton';
import { GroupInspectButton, GroupModalPicker } from '../groups';
import { RoomInspectButton, RoomModalPicker } from '../rooms';

type PartialGroup = Pick<
  GroupDTO,
  '_id' | 'friendlyName' | 'type' | 'save_states'
>;

export function PersonConfiguration(props: {
  onUpdate: (person: PersonDTO) => void;
  person: PersonDTO;
}) {
  const [group, setGroup] = useState<GroupDTO>();
  const [groups, setGroups] = useState<PartialGroup[]>([]);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);

  useEffect(() => {
    async function refresh(): Promise<void> {
      setGroups(
        await sendRequest({
          control: {
            select: [
              'friendlyName',
              'type',
              'save_states.friendlyName',
              'save_states.id',
            ],
          },
          url: `/group`,
        }),
      );
      setRooms(
        await sendRequest({
          url: `/room`,
        }),
      );
    }
    refresh();
  }, []);

  async function addEntities(entities: string[]): Promise<void> {
    const person = props.person;
    person.entities = [
      ...person.entities,
      ...entities.map(entity_id => ({ entity_id })),
    ];
    props.onUpdate(
      await sendRequest<PersonDTO>({
        body: {
          entities: person.entities,
        } as Partial<PersonDTO>,
        method: 'put',
        url: `/person/${person._id}`,
      }),
    );
  }

  async function addGroups(groups: string[]): Promise<void> {
    const person = props.person;
    props.onUpdate(
      await sendRequest<PersonDTO>({
        body: { groups },
        method: 'post',
        url: `/person/${person._id}/group`,
      }),
    );
  }

  async function addRooms(rooms: string[]): Promise<void> {
    const person = props.person;
    props.onUpdate(
      await sendRequest<PersonDTO>({
        body: { rooms },
        method: 'post',
        url: `/person/${person._id}/room`,
      }),
    );
  }

  async function detachGroup(group: string): Promise<void> {
    let person = props.person;
    person = await sendRequest({
      body: { groups: person.groups.filter(i => i !== group) },
      method: 'put',
      url: `/person/${person._id}`,
    });
    props.onUpdate(person);
  }

  async function detachRoom(room: string): Promise<void> {
    let person = props.person;
    person = await sendRequest({
      body: { rooms: person.rooms.filter(i => i !== room) },
      method: 'put',
      url: `/person/${person._id}`,
    });
    props.onUpdate(person);
  }

  function entityRender({ entity_id }: RoomEntityDTO) {
    return (
      <List.Item
        actions={[
          <Popconfirm
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            title="Are you sure you want to delete this?"
            onConfirm={() => removeEntity(entity_id)}
          >
            <Button danger type="text" size="small">
              X
            </Button>
          </Popconfirm>,
        ]}
      >
        <List.Item.Meta title={<EntityInspectButton entity_id={entity_id} />} />
      </List.Item>
    );
  }

  function groupRender(item: string) {
    const group = groups.find(({ _id }) => _id === item);
    if (!group) {
      return undefined;
    }
    return (
      <List.Item
        key={item}
        actions={[
          <Popconfirm
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            title={`Detach group?`}
            onConfirm={() => detachGroup(item)}
          >
            <Button danger type="text">
              <CloseOutlined />
            </Button>
          </Popconfirm>,
        ]}
      >
        <List.Item.Meta
          title={
            <GroupInspectButton
              group={group as GroupDTO}
              onUpdate={group => updateGroup(group)}
            />
          }
          description={`${TitleCase(group.type)} group`}
        />
      </List.Item>
    );
  }

  async function removeEntity(entity: string): Promise<void> {
    props.onUpdate(
      await sendRequest<PersonDTO>({
        method: 'delete',
        url: `/person/${props.person._id}/entity/${entity}`,
      }),
    );
  }

  function roomRender(item: string) {
    const room = rooms.find(({ _id }) => _id === item);
    if (!room) {
      return undefined;
    }
    return (
      <List.Item
        key={item}
        actions={[
          <Popconfirm
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            title={`Detach room?`}
            onConfirm={() => detachRoom(item)}
          >
            <Button danger type="text">
              <CloseOutlined />
            </Button>
          </Popconfirm>,
        ]}
      >
        <List.Item.Meta
          title={
            <RoomInspectButton
              room={room}
              onUpdate={room => updateRoom(room)}
            />
          }
        />
      </List.Item>
    );
  }

  function updateGroup(group: GroupDTO): void {
    if (!group) {
      setGroup(undefined);
      setGroups(groups.filter(({ _id }) => _id !== group._id));
      return;
    }
    setGroups(groups.map(g => (g._id === group._id ? group : g)));
  }

  function updateRoom(room: RoomDTO): void {
    if (!room) {
      // setRoom(undefined);
      setRooms(rooms.filter(({ _id }) => _id !== group._id));

      return;
    }
    setRooms(rooms.map(g => (g._id === room._id ? room : g)));
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card
        type="inner"
        title={<Typography.Text strong>Entities</Typography.Text>}
        extra={
          <EntityModalPicker
            highlight={is.empty(props.person.entities)}
            onAdd={items => addEntities(items)}
            exclude={props.person.entities.map(({ entity_id }) => entity_id)}
          />
        }
      >
        <List
          dataSource={(props.person.entities ?? []).sort((a, b) =>
            a > b ? UP : DOWN,
          )}
          pagination={{ size: 'small' }}
          renderItem={item => entityRender(item)}
        />
      </Card>
      <Card
        type="inner"
        title={<Typography.Text strong>Groups</Typography.Text>}
        extra={
          <GroupModalPicker
            highlight={is.empty(props.person.groups)}
            exclude={props.person.groups}
            onAdd={groups => addGroups(groups)}
          />
        }
      >
        <List
          pagination={{ size: 'small' }}
          dataSource={props.person.groups}
          renderItem={item => groupRender(item)}
        />
      </Card>
      <Card
        type="inner"
        title={<Typography.Text strong>Rooms</Typography.Text>}
        extra={
          <RoomModalPicker
            highlight={is.empty(props.person.rooms)}
            exclude={props.person.rooms}
            onAdd={rooms => addRooms(rooms)}
          />
        }
      >
        <List
          pagination={{ size: 'small' }}
          dataSource={props.person.rooms}
          renderItem={item => roomRender(item)}
        />
      </Card>
    </Space>
  );
}
