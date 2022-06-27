import {
  PersonDTO,
  RoomDTO,
  RoutineCommandWebhookDTO,
} from '@steggy/controller-shared';
import { Form, Input, Select, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { WebhookRequestBuilder } from './webhook';

// eslint-disable-next-line radar/cognitive-complexity
export function WebhookRequest(props: {
  onUpdate?: (value: Partial<RoutineCommandWebhookDTO>) => void;
  webhook?: RoutineCommandWebhookDTO;
}) {
  const [people, setPeople] = useState<PersonDTO[]>([]);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);

  function assignTarget() {
    const room = rooms.find(({ _id }) => _id === props.webhook?.assignTo);
    if (room) {
      return room.metadata;
    }
    const person = people.find(({ _id }) => _id === props.webhook?.assignTo);
    if (person) {
      return person.metadata;
    }
    return undefined;
  }

  useEffect(() => {
    async function refresh(): Promise<void> {
      const rooms = await sendRequest<RoomDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'metadata.0',
              operation: 'exists',
              value: true,
            },
          ]),
          select: ['friendlyName', 'metadata'],
          sort: ['friendlyName'],
        },
        url: `/room`,
      });
      const people = await sendRequest<RoomDTO[]>({
        control: {
          filters: new Set([
            {
              field: 'metadata.0',
              operation: 'exists',
              value: true,
            },
          ]),
          select: ['friendlyName', 'metadata'],
          sort: ['friendlyName'],
        },
        url: `/person`,
      });
      setPeople(people);
      setRooms(rooms);
    }
    refresh();
  }, []);

  function assignTo(assignTo: string): void {
    const assignType = rooms.some(({ _id }) => _id === assignTo)
      ? 'room'
      : 'person';
    props.onUpdate({ assignTo, assignType });
  }

  const parse = props.webhook?.parse ?? 'none';
  const target = assignTarget();
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <WebhookRequestBuilder
        webhook={props.webhook}
        onUpdate={value => props.onUpdate(value)}
      />
      <Form.Item label="Response">
        <Select value={parse} onChange={parse => props.onUpdate({ parse })}>
          <Select.Option value="none">Ignore</Select.Option>
          <Select.Option value="text">Text</Select.Option>
          <Select.Option value="json">JSON</Select.Option>
        </Select>
      </Form.Item>
      {parse === 'json' ? (
        <Form.Item label="Data Path">
          <Input
            placeholder="object.path.to.value"
            defaultValue={props.webhook?.objectPath}
            onBlur={({ target }) =>
              props.onUpdate({ objectPath: target.value })
            }
          />
        </Form.Item>
      ) : undefined}
      {parse === 'none' ? undefined : (
        <Form.Item label="Assign To">
          <Select value={props.webhook.assignTo} onChange={to => assignTo(to)}>
            <Select.OptGroup label="Room">
              {rooms.map(room => (
                <Select.Option key={room._id} value={room._id}>
                  {room.friendlyName}
                </Select.Option>
              ))}
            </Select.OptGroup>
            <Select.OptGroup label="Person">
              {people.map(person => (
                <Select.Option key={person._id} value={person._id}>
                  {person.friendlyName}
                </Select.Option>
              ))}
            </Select.OptGroup>
          </Select>
        </Form.Item>
      )}
      {target ? (
        <Form.Item label="Property">
          <Select>
            {target.map(metadata => (
              <Select.Option value={metadata.name} key={metadata.id}>
                <Typography.Text code>{metadata.type}</Typography.Text>
                {` ${metadata.name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      ) : undefined}
    </Space>
  );
}
