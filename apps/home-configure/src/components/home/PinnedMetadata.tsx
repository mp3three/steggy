import {
  PersonDTO,
  PinnedItemDTO,
  RoomDTO,
  RoomMetadataDTO,
} from '@steggy/controller-shared';
import { DOWN, is, TitleCase, UP } from '@steggy/utilities';
import { Button, Card, Empty, List, Skeleton, Space, Typography } from 'antd';
import { useContext, useEffect, useState } from 'react';

import { CurrentUserContext, sendRequest } from '../../types';
import { MetadataEdit } from '../misc';
import { PersonInspectButton } from '../people';
import { RoomInspectButton } from '../rooms';

export function PinnedMetadata() {
  const [metadata, setMetadata] = useState<RoomMetadataDTO>();
  const [people, setPeople] = useState<RoomDTO[]>([]);
  const [person, setPerson] = useState<PersonDTO>();
  const [room, setRoom] = useState<RoomDTO>();
  const [rooms, setRooms] = useState<RoomDTO[]>([]);

  const userContext = useContext(CurrentUserContext);

  function renderItem(item: PinnedItemDTO) {
    if (item.type === 'room_metadata') {
      const room = rooms.find(({ metadata }) =>
        metadata.some(({ id }) => id === item.target),
      );
      const data = (room?.metadata ?? []).find(({ id }) => id === item.target);
      if (!room || !data) {
        return (
          <List.Item>
            <Skeleton.Input />
          </List.Item>
        );
      }
      return (
        <List.Item>
          <List.Item.Meta
            title={
              <Space>
                <RoomInspectButton room={room} />
                {' > '}
                <Button
                  size="small"
                  onClick={() => {
                    setRoom(room);
                    setMetadata(data);
                  }}
                  type={data?.id === metadata?.id ? 'primary' : 'text'}
                >
                  {data?.name}
                </Button>
              </Space>
            }
            description={TitleCase(item.type)}
          />
          <Space>{renderValue(data)}</Space>
        </List.Item>
      );
    }

    const person = people.find(({ metadata }) =>
      metadata.some(({ id }) => id === item.target),
    );
    const data = (person?.metadata ?? []).find(({ id }) => id === item.target);
    return (
      <List.Item>
        <List.Item.Meta
          title={
            <Space>
              <PersonInspectButton person={person} />
              {' > '}
              <Button
                size="small"
                onClick={() => {
                  setPerson(person);
                  setMetadata(data);
                }}
                type={data?.id === metadata?.id ? 'primary' : 'text'}
              >
                {data?.name}
              </Button>
            </Space>
          }
          description={TitleCase(item.type)}
        />
        <Space>{renderValue(data)}</Space>
      </List.Item>
    );
  }

  function renderValue(data: RoomMetadataDTO) {
    if (is.empty(data?.type)) {
      return undefined;
    }
    if (data.type === 'boolean' || data.type === 'number') {
      return String(data.value as boolean);
    }
    if (data.type === 'string' || data.type === 'enum') {
      return data.value;
    }
    if (data.type === 'date') {
      return new Date(data.value as string).toLocaleString();
    }
    return undefined;
  }

  async function updateMetadata(update: Partial<RoomMetadataDTO>) {
    const meta = {
      ...metadata,
      ...update,
    };
    setMetadata(meta);
    if (person) {
      person.metadata = person.metadata.map(item =>
        item.id === meta.id ? meta : item,
      );
      const data = await sendRequest<PersonDTO>({
        body: update,
        method: 'put',
        url: `/person/${person._id}/metadata/${meta.id}`,
      });
      setPerson(data);
      setPeople(people.map(item => (item._id === data._id ? data : item)));
    }
    if (room) {
      room.metadata = room.metadata.map(item =>
        item.id === meta.id ? meta : item,
      );
      const data = await sendRequest<PersonDTO>({
        body: update,
        method: 'put',
        url: `/room/${room._id}/metadata/${meta.id}`,
      });
      setRoom(data);
      setRooms(rooms.map(item => (item._id === data._id ? data : item)));
    }
  }

  useEffect(() => {
    async function loadRooms() {
      const targets = (userContext.person?.pinned_items ?? [])
        .filter(({ type }) => type === 'room_metadata')
        .map(({ target }) => target);
      if (is.empty(targets)) {
        setRooms([]);
        return;
      }
      const rooms = await sendRequest<RoomDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'metadata.id',
              operation: 'in',
              value: targets,
            },
          ]),
        },
        url: `/room`,
      });
      setRooms(rooms);
    }
    async function loadPeople() {
      const targets = (userContext.person?.pinned_items ?? [])
        .filter(({ type }) => type === 'person_metadata')
        .map(({ target }) => target);
      if (is.empty(targets)) {
        setPeople([]);
        return;
      }
      const person = await sendRequest<PersonDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'metadata.id',
              operation: 'in',
              value: targets,
            },
          ]),
        },
        url: `/person`,
      });
      setPeople(person);
    }
    loadPeople();
    loadRooms();
  }, [userContext.person?.pinned_items]);

  return (
    <Card
      type="inner"
      title={<Typography.Text strong>Pinned Metadata</Typography.Text>}
    >
      <CurrentUserContext.Consumer>
        {({ person }) =>
          person ? (
            <>
              <List
                pagination={{ size: 'small' }}
                dataSource={(person.pinned_items ?? [])
                  .filter(({ type }) =>
                    ['room_metadata', 'person_metadata'].includes(type),
                  )
                  .sort((a, b) => (a.type > b.type ? UP : DOWN))}
                renderItem={item => renderItem(item)}
              />
              <MetadataEdit
                room={room || person}
                type={room ? 'room' : 'person'}
                metadata={metadata}
                onUpdate={update => updateMetadata(update)}
                onComplete={() => {
                  setMetadata(undefined);
                  setRoom(undefined);
                }}
              />
            </>
          ) : (
            <Empty description="Select a user on the settings page to view pinned items" />
          )
        }
      </CurrentUserContext.Consumer>
    </Card>
  );
}
