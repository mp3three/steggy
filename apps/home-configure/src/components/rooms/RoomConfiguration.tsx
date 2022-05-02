import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GroupDTO, RoomDTO, RoomEntityDTO } from '@steggy/controller-shared';
import { DOWN, is, TitleCase, UP } from '@steggy/utilities';
import { Button, Card, List, Popconfirm, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { EntityModalPicker } from '../entities';
import { EntityInspectButton } from '../entities/InspectButton';
import { GroupInspectButton, GroupModalPicker } from '../groups';

type PartialGroup = Pick<
  GroupDTO,
  '_id' | 'friendlyName' | 'type' | 'save_states'
>;

export function RoomConfiguration(props: {
  onUpdate: (room: RoomDTO) => void;
  room: RoomDTO;
}) {
  const [groups, setGroups] = useState<PartialGroup[]>([]);

  useEffect(() => {
    refresh();
  }, []);

  async function addEntities(entities: string[]): Promise<void> {
    const room = props.room;
    room.entities = [
      ...room.entities,
      ...entities.map(entity_id => ({ entity_id })),
    ];
    props.onUpdate(
      await sendRequest<RoomDTO>({
        body: {
          entities: room.entities,
        } as Partial<RoomDTO>,
        method: 'put',
        url: `/room/${room._id}`,
      }),
    );
  }

  async function addGroups(groups: string[]): Promise<void> {
    const room = props.room;
    props.onUpdate(
      await sendRequest<RoomDTO>({
        body: { groups },
        method: 'post',
        url: `/room/${room._id}/group`,
      }),
    );
  }

  async function detachGroup(group: string): Promise<void> {
    let room = props.room;
    room = await sendRequest({
      body: { groups: room.groups.filter(i => i !== group) },
      method: 'put',
      url: `/room/${room._id}`,
    });
    props.onUpdate(room);
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
  }

  async function removeEntity(entity: string): Promise<void> {
    props.onUpdate(
      await sendRequest<RoomDTO>({
        method: 'delete',
        url: `/room/${props.room._id}/entity/${entity}`,
      }),
    );
  }

  function updateGroup(group: GroupDTO): void {
    if (!group) {
      setGroups(groups.filter(({ _id }) => _id !== group._id));
      return;
    }
    setGroups(groups.map(g => (g._id === group._id ? group : g)));
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card
        type="inner"
        title={<Typography.Text strong>Entities</Typography.Text>}
        extra={
          <EntityModalPicker
            highlight={is.empty(props.room.entities)}
            onAdd={entities => addEntities(entities)}
            exclude={props.room.entities.map(({ entity_id }) => entity_id)}
          />
        }
      >
        <List
          pagination={{ size: 'small' }}
          dataSource={(props.room.entities ?? []).sort((a, b) =>
            a > b ? UP : DOWN,
          )}
          renderItem={item => entityRender(item)}
        />
      </Card>
      <Card
        type="inner"
        title={<Typography.Text strong>Groups</Typography.Text>}
        extra={
          <GroupModalPicker
            highlight={is.empty(props.room.groups)}
            exclude={props.room.groups}
            onAdd={groups => addGroups(groups)}
          />
        }
      >
        <List
          pagination={{ size: 'small' }}
          dataSource={props.room.groups}
          renderItem={item => groupRender(item)}
        />
      </Card>
    </Space>
  );
}
