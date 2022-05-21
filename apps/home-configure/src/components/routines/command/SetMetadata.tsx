import {
  PersonDTO,
  RoomDTO,
  RoomMetadataDTO,
  SetRoomMetadataCommandDTO,
} from '@steggy/controller-shared';
import { EMPTY, is, SINGLE } from '@steggy/utilities';
import {
  Form,
  Input,
  Radio,
  Select,
  Skeleton,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import { parse } from 'mathjs';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../../types';
import { ChronoExamples, renderDateExpression } from '../../misc';

// eslint-disable-next-line radar/cognitive-complexity
export function SetRoomMetadataCommand(props: {
  command?: SetRoomMetadataCommandDTO;
  onUpdate: (command: Partial<SetRoomMetadataCommandDTO>) => void;
}) {
  const [people, setPeople] = useState<
    Pick<PersonDTO, '_id' | 'friendlyName' | 'metadata'>[]
  >([]);
  const [rooms, setRooms] = useState<
    Pick<RoomDTO, '_id' | 'friendlyName' | 'metadata'>[]
  >([]);
  const [expression, setExpression] = useState<string>();
  const [parsedExpression, setParsedExpression] = useState<string[]>([]);

  useEffect(() => {
    async function refresh() {
      const [parsed] = await sendRequest<string[][]>({
        body: { expression: [expression] },
        method: 'post',
        url: `/debug/chrono-parse`,
      });
      setParsedExpression(parsed);
    }
    if (props?.command?.type !== 'date') {
      return;
    }
    refresh();
  }, [expression, props?.command]);

  const room =
    rooms.find(({ _id }) => _id === props.command?.room) ||
    people.find(({ _id }) => _id === props.command?.room);

  const value = (room?.metadata ?? []).find(
    ({ name }) => name === props.command.name,
  )?.value;

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

  function onTargetUpdate(room: string): void {
    props.onUpdate({
      name: undefined,
      room,
      type: rooms.some(({ _id }) => _id === room) ? 'room' : 'person',
      value: undefined,
    });
  }

  function renderValue() {
    if (is.empty(room?.metadata)) {
      return <Skeleton.Input active />;
    }
    const metadata = room.metadata.find(
      ({ name }) => name === props.command.name,
    );
    if (!metadata) {
      return <Skeleton.Input active />;
    }
    if (metadata.type === 'boolean') {
      return renderValueBoolean();
    }
    if (metadata.type === 'enum') {
      return renderValueEnum(metadata);
    }
    if (metadata.type === 'string') {
      return renderValueString();
    }
    if (metadata.type === 'number') {
      return renderValueNumber();
    }
    if (metadata.type === 'date') {
      return renderValueDate();
    }
    return undefined;
  }

  function renderValueBoolean() {
    return (
      <Form.Item label="Value">
        <Radio.Group
          buttonStyle="solid"
          value={props.command.value ?? 'toggle'}
          onChange={({ target }) => props.onUpdate({ value: target.value })}
        >
          <Radio.Button value={true}>Checked</Radio.Button>
          <Radio.Button value={false}>Unchecked</Radio.Button>
          <Radio.Button value={`toggle`}>Toggle</Radio.Button>
        </Radio.Group>
      </Form.Item>
    );
  }

  function renderValueDate() {
    setExpression(props.command.value as string);
    return (
      <>
        <Form.Item label="Value">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input
              placeholder="tomorrow"
              defaultValue={String(props.command.value)}
              onBlur={({ target }) => props.onUpdate({ value: target.value })}
            />
            <Typography.Paragraph>
              {renderDateExpression(parsedExpression)}
            </Typography.Paragraph>
          </Space>
        </Form.Item>
        <ChronoExamples />
      </>
    );
  }

  function renderValueEnum(metadata: RoomMetadataDTO) {
    return (
      <Form.Item label="Value">
        <Select
          value={props.command.value}
          onChange={(value: string) => props.onUpdate({ value })}
        >
          {metadata.options.map(option => (
            <Select.Option value={option} key={option}>
              {option}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  }

  function renderValueNumber() {
    const exampleA = `${props.command.name} + 5`;
    const nodeA = parse(exampleA);
    const exampleB = `cos(45 deg)`;
    const nodeB = parse(exampleB);
    const currentValue = is.number(value) ? value : EMPTY;

    return (
      <Form.Item label="Value">
        <Space direction="vertical">
          <Radio.Group
            buttonStyle="solid"
            value={props.command?.type ?? 'set_value'}
            onChange={({ target }) => props.onUpdate({ type: target.value })}
          >
            <Radio.Button value="set_value">Set value</Radio.Button>
            <Radio.Button value="increment">Increment</Radio.Button>
            <Radio.Button value="decrement">Decrement</Radio.Button>
            <Radio.Button value="formula">Formula</Radio.Button>
          </Radio.Group>
          {props.command?.type === 'formula' ? (
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ textAlign: 'right' }}>
                <Tooltip
                  title={
                    <Typography>
                      <Typography.Title level={4}>Overview</Typography.Title>
                      <Typography.Paragraph>
                        Enter a math expression, the result will be set as the
                        new metadata value.
                      </Typography.Paragraph>
                      <Typography.Title level={4}>Examples</Typography.Title>
                      <Typography.Paragraph>
                        <Typography.Text code>{exampleA}</Typography.Text>=
                        <Typography.Text code>
                          {String(
                            nodeA.evaluate({
                              [props.command.name]: currentValue,
                            }),
                          )}
                        </Typography.Text>
                      </Typography.Paragraph>
                      <Typography.Paragraph>
                        <Typography.Text code>{exampleB}</Typography.Text>=
                        <Typography.Text code>
                          {String(
                            nodeB.evaluate({
                              [props.command.name]: currentValue,
                            }),
                          )}
                        </Typography.Text>
                      </Typography.Paragraph>
                    </Typography>
                  }
                >
                  {FD_ICONS.get('information')}
                </Tooltip>
              </div>
              <Input.TextArea
                style={{ width: '100%' }}
                defaultValue={String(props.command?.value)}
                onBlur={({ target }) => props.onUpdate({ value: target.value })}
              />
            </Space>
          ) : (
            <Input
              type="number"
              defaultValue={Number(props.command.value ?? SINGLE)}
              onBlur={({ target }) => props.onUpdate({ value: target.value })}
            />
          )}
        </Space>
      </Form.Item>
    );
  }

  function renderValueString() {
    const type = props.command?.type ?? 'simple';
    return (
      <>
        <Form.Item label="Type">
          <Select
            style={{ width: '250px' }}
            value={type}
            onChange={type => props.onUpdate({ type })}
          >
            <Select.Option value="simple">Plain Text</Select.Option>
            <Select.Option value="template">
              Home Assistant Template
            </Select.Option>
            <Select.Option value="javascript">Javascript</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Value">
          <Input.TextArea
            defaultValue={props.command.value as string}
            onBlur={({ target }) => props.onUpdate({ value: target.value })}
          />
        </Form.Item>
      </>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item label="Target">
        <Select
          value={room?._id}
          onChange={room => onTargetUpdate(room)}
          showSearch
          style={{ width: '100%' }}
        >
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
      <Form.Item label="Property">
        {room ? (
          is.empty(room.metadata) ? (
            <Typography.Text type="warning">
              Room does not have metadata
            </Typography.Text>
          ) : (
            <Select
              value={props.command?.name}
              onChange={name => props.onUpdate({ name })}
            >
              {(room.metadata ?? []).map(state => (
                <Select.Option key={state.id} value={state.name}>
                  {state.name}
                </Select.Option>
              ))}
            </Select>
          )
        ) : (
          <Skeleton.Input style={{ width: '200px' }} active />
        )}
      </Form.Item>
      {renderValue()}
    </Space>
  );
}
