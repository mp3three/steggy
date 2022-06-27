import {
  PersonDTO,
  RoomDTO,
  RoutineCommandWebhookDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Form, Input, Select, Space, Tooltip, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../../types';
import { TypedEditor } from '../../misc';
import { WebhookRequestBuilder } from '../../misc/webhook';

const STOP_TYPE = [
  `/**`,
  ` * Execute function to stop routine execution`,
  ` */`,
  `const stop_processing:() => void;`,
  `const steggy: iVMBreakoutAPI = undefined;`,
].join(`\n`);

// eslint-disable-next-line radar/cognitive-complexity
export function WebhookCommand(props: {
  command?: RoutineCommandWebhookDTO;
  onUpdate: (command: Partial<RoutineCommandWebhookDTO>) => void;
}) {
  const [people, setPeople] = useState<PersonDTO[]>([]);
  const [rooms, setRooms] = useState<RoomDTO[]>([]);

  function assignTarget() {
    const room = rooms.find(({ _id }) => _id === props.command?.assignTo);
    if (room) {
      return room.metadata;
    }
    const person = people.find(({ _id }) => _id === props.command?.assignTo);
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

  const parse = props.command?.parse ?? 'none';
  const target = assignTarget();
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <WebhookRequestBuilder
        webhook={props.command}
        onUpdate={value => props.onUpdate(value)}
      />
      <Form.Item label="Handler">
        <Select
          value={props.command.assignTo || 'none'}
          onChange={to => assignTo(to)}
        >
          <Select.Option value="none">
            <Typography.Text type="warning">Do Nothing</Typography.Text>
          </Select.Option>
          <Select.Option value="eval">
            <Typography.Text type="success">TS Evaluate</Typography.Text>
          </Select.Option>
          <Select.OptGroup label="Assign to Room">
            {rooms.map(room => (
              <Select.Option key={room._id} value={room._id}>
                {room.friendlyName}
              </Select.Option>
            ))}
          </Select.OptGroup>
          <Select.OptGroup label="Assign to Person">
            {people.map(person => (
              <Select.Option key={person._id} value={person._id}>
                {person.friendlyName}
              </Select.Option>
            ))}
          </Select.OptGroup>
        </Select>
      </Form.Item>
      {props.command.assignTo === 'none' ||
      is.empty(props.command.assignTo) ? undefined : (
        <>
          <Form.Item
            label={
              props.command.assignTo === 'eval' ? (
                <Tooltip
                  title={
                    <Typography>
                      {'Response data made available in the '}
                      <Typography.Text code>response</Typography.Text>
                      {' variable'}
                    </Typography>
                  }
                >
                  {FD_ICONS.get('information')}
                  {` Response`}
                </Tooltip>
              ) : (
                `Response`
              )
            }
          >
            <Select value={parse} onChange={parse => props.onUpdate({ parse })}>
              <Select.Option value="text">Text</Select.Option>
              <Select.Option value="json">JSON</Select.Option>
            </Select>
          </Form.Item>
          {props.command.assignTo === 'eval' ? (
            <Form.Item>
              <TypedEditor
                code={props.command.code}
                onUpdate={code => props.onUpdate({ code })}
                type="execute"
                extraTypes={
                  ''
                  // parse === 'text'
                  //   ? `${STOP_TYPE}\nconst response: string = "";`
                  //   : // TODO: It'd be cool to cast this
                  //     `${STOP_TYPE}\nconst response: Record<string,unknown> = {};`
                }
              />
            </Form.Item>
          ) : (
            <>
              {parse === 'json' ? (
                <Form.Item label="Data Path">
                  <Input
                    placeholder="object.path.to.value (blank for whole object)"
                    defaultValue={props.command?.objectPath}
                    onBlur={({ target }) =>
                      props.onUpdate({ objectPath: target.value })
                    }
                  />
                </Form.Item>
              ) : undefined}
              {target ? (
                <Form.Item label="Property" required>
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
            </>
          )}
        </>
      )}
    </Space>
  );
}
