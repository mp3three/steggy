import {
  PersonDTO,
  RoomDTO,
  RoutineCommandWebhookDTO,
} from '@steggy/controller-shared';
import { Button, Form, Input, Select, Space, Table, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../types';

// eslint-disable-next-line radar/cognitive-complexity
export function WebhookRequest(props: {
  onUpdate?: (value: Partial<RoutineCommandWebhookDTO>) => void;
  webhook?: RoutineCommandWebhookDTO;
}) {
  const [people, setPeople] = useState<PersonDTO[]>();
  const [rooms, setRooms] = useState<RoomDTO[]>();
  // override state = { people: [], rooms: [] } as tState;

  function assignTarget() {
    const room = rooms.find(({ _id }) => _id === props.webhook.assignTo);
    if (room) {
      return room.metadata;
    }
    const person = people.find(({ _id }) => _id === props.webhook.assignTo);
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
      <Form.Item label="URL">
        <Input
          placeholder="http://some.domain/api/target"
          defaultValue={props.webhook?.url}
          onBlur={({ target }) => props.onUpdate({ url: target.value })}
        />
      </Form.Item>
      <Form.Item label="Method">
        <Select
          value={props.webhook?.method}
          onChange={method => props.onUpdate({ method })}
        >
          <Select.Option value="get">GET</Select.Option>
          <Select.Option value="post">POST</Select.Option>
          <Select.Option value="put">PUT</Select.Option>
          <Select.Option value="delete">DELETE</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item label="Headers">
        <div style={{ marginBottom: '8px', textAlign: 'right' }}>
          <Button
            type="primary"
            size="small"
            onClick={() =>
              props.onUpdate({
                headers: [
                  ...(props.webhook?.headers ?? []),
                  { header: '', value: '' },
                ],
              })
            }
          >
            Add
          </Button>
        </div>
        <Table dataSource={props.webhook?.headers ?? []}>
          <Table.Column
            title="Header"
            dataIndex="header"
            key="header"
            render={(i, record, index) => (
              <Input
                value={i}
                onChange={({ target }) =>
                  props.onUpdate({
                    headers: props.webhook?.headers.map(
                      ({ header, value }, index_) =>
                        index_ === index
                          ? { header: target.value, value }
                          : { header, value },
                    ),
                  })
                }
              />
            )}
          />
          <Table.Column
            title="Value"
            dataIndex="value"
            key="value"
            render={(i, record, index) => (
              <Input
                defaultValue={i}
                onBlur={({ target }) =>
                  props.onUpdate({
                    headers: props.webhook.headers.map(
                      ({ header, value }, index_) =>
                        index_ === index
                          ? { header, value: target.value }
                          : { header, value },
                    ),
                  })
                }
              />
            )}
          />
        </Table>
      </Form.Item>
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
