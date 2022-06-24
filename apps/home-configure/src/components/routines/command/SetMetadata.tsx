import {
  PersonDTO,
  RoomDTO,
  RoomMetadataDTO,
  SetRoomMetadataCommandDTO,
} from '@steggy/controller-shared';
import { is, SINGLE } from '@steggy/utilities';
import { Form, Input, Radio, Select, Skeleton, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';
import {
  ChronoExamples,
  EvalHelp,
  MathHelp,
  renderDateExpression,
} from '../../misc';

// eslint-disable-next-line radar/cognitive-complexity
export function SetRoomMetadataCommand(props: {
  command?: SetRoomMetadataCommandDTO;
  onUpdate: (command: Partial<SetRoomMetadataCommandDTO>) => void;
}) {
  const command = props.command ?? ({} as SetRoomMetadataCommandDTO);
  const [people, setPeople] = useState<
    Pick<PersonDTO, '_id' | 'friendlyName' | 'metadata'>[]
  >([]);
  const [rooms, setRooms] = useState<
    Pick<RoomDTO, '_id' | 'friendlyName' | 'metadata'>[]
  >([]);
  const [expression, setExpression] = useState<string>(command.value as string);
  const [parsedExpression, setParsedExpression] = useState<string[]>([]);
  const [mathExpression, setMathExpression] = useState<string>(
    (command.value as string) ?? '',
  );
  const [evalExpression, setEvalExpression] = useState<string>(
    (command.value as string) ?? '',
  );

  useEffect(() => {
    async function refresh() {
      const [parsed] = await sendRequest<string[][]>({
        body: { expression: [expression] },
        method: 'post',
        url: `/debug/chrono-parse`,
      });
      setParsedExpression(parsed);
    }
    if (props?.command?.valueType !== 'date') {
      return;
    }
    refresh();
  }, [expression, props?.command]);

  const room =
    rooms.find(({ _id }) => _id === command?.room) ||
    people.find(({ _id }) => _id === command?.room);

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
    const metadata = room.metadata.find(({ name }) => name === command.name);
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
      <>
        <Form.Item label="Value">
          <Radio.Group
            buttonStyle="solid"
            value={command.valueType ?? 'toggle'}
            onChange={({ target }) =>
              props.onUpdate({ valueType: target.value })
            }
          >
            <Radio.Button value={true}>Checked</Radio.Button>
            <Radio.Button value={false}>Unchecked</Radio.Button>
            <Radio.Button value={`toggle`}>Toggle</Radio.Button>
            <Radio.Button value="eval">Javascript</Radio.Button>
          </Radio.Group>
        </Form.Item>
        {command?.valueType === 'eval' ? (
          <>
            <Form.Item>
              <Input.TextArea
                style={{ minHeight: '300px', width: '100%' }}
                placeholder={`if (sensor.total_consumption > 350) {\n  return false;\n}\nreturn true;`}
                value={evalExpression}
                onChange={({ target }) => setEvalExpression(target.value)}
                onBlur={() => props.onUpdate({ value: evalExpression })}
              />
            </Form.Item>
            <EvalHelp
              addVariable={variable =>
                setEvalExpression(evalExpression + variable)
              }
            />
          </>
        ) : undefined}
      </>
    );
  }

  function renderValueDate() {
    return (
      <>
        <Form.Item label="Value">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio.Group
              buttonStyle="solid"
              value={command.valueType ?? 'toggle'}
              onChange={({ target }) =>
                props.onUpdate({ value: undefined, valueType: target.value })
              }
            >
              <Radio.Button value="expression">Expression</Radio.Button>
              <Radio.Button value="eval">Javascript</Radio.Button>
            </Radio.Group>
            {command.valueType === 'expression' ? (
              <>
                <Input
                  placeholder="tomorrow"
                  value={expression}
                  onChange={({ target }) => setExpression(target.value)}
                  onBlur={() => props.onUpdate({ value: expression })}
                />
                <Typography.Paragraph>
                  {renderDateExpression(parsedExpression)}
                </Typography.Paragraph>
              </>
            ) : undefined}
          </Space>
        </Form.Item>
        {command.valueType === 'eval' ? (
          <Input.TextArea
            placeholder={`const tomorrow = dayjs().add(1,'day');\n\nif (dayjs(person.date).isAfter(tomorrow)) {\n  return tomorrow.toDate();\n}\nreturn new Date();`}
            value={expression}
            style={{ minHeight: '300px' }}
            onChange={({ target }) => setExpression(target.value)}
            onBlur={() => props.onUpdate({ value: expression })}
          />
        ) : undefined}
        {command.valueType === 'expression' ? <ChronoExamples /> : undefined}
        {command.valueType === 'eval' ? (
          <EvalHelp
            addVariable={variable => setExpression(expression + variable)}
          />
        ) : undefined}
      </>
    );
  }

  function renderValueEnum(metadata: RoomMetadataDTO) {
    return (
      <Form.Item label="Value">
        <Select
          value={command.value}
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
    return (
      <>
        <Form.Item label="Value">
          <Radio.Group
            buttonStyle="solid"
            value={command?.valueType ?? 'set_value'}
            onChange={({ target }) =>
              props.onUpdate({ value: undefined, valueType: target.value })
            }
          >
            <Radio.Button value="set_value">Set Value</Radio.Button>
            <Radio.Button value="increment">Increment</Radio.Button>
            <Radio.Button value="decrement">Decrement</Radio.Button>
            <Radio.Button value="formula">Math Formula</Radio.Button>
            <Radio.Button value="eval">Javascript</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          {command?.valueType === 'formula' ? (
            <Input.TextArea
              style={{ minHeight: '300px', width: '100%' }}
              value={mathExpression}
              onChange={({ target }) => setMathExpression(target.value)}
              onBlur={() => props.onUpdate({ value: mathExpression })}
            />
          ) : undefined}
          {command?.valueType === 'eval' ? (
            <Input.TextArea
              style={{ minHeight: '300px', width: '100%' }}
              placeholder={`if (sensor.total_consumption > 350) {\n  return 220;\n}\nreturn 654;`}
              value={evalExpression}
              onChange={({ target }) => setEvalExpression(target.value)}
              onBlur={() => props.onUpdate({ value: evalExpression })}
            />
          ) : undefined}
          {!['formula', 'eval'].includes(command.valueType) ? (
            <Input
              type="number"
              defaultValue={Number(command.value ?? SINGLE)}
              onBlur={({ target }) => props.onUpdate({ value: target.value })}
            />
          ) : undefined}
        </Form.Item>
        {command?.valueType === 'formula' ? (
          <MathHelp
            addVariable={variable =>
              setMathExpression(mathExpression + variable)
            }
          />
        ) : undefined}
        {command?.valueType === 'eval' ? (
          <EvalHelp
            addVariable={variable =>
              setEvalExpression(evalExpression + variable)
            }
          />
        ) : undefined}
      </>
    );
  }

  function renderValueString() {
    const type = command?.valueType ?? 'simple';
    return (
      <>
        <Form.Item label="Type">
          <Select
            style={{ width: '250px' }}
            value={type}
            onChange={valueType => props.onUpdate({ valueType })}
          >
            <Select.Option value="simple">Plain Text</Select.Option>
            <Select.Option value="template">
              Home Assistant Template
            </Select.Option>
            <Select.Option value="eval">Javascript</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Input.TextArea
            style={{ minHeight: '300px', width: '100%' }}
            placeholder={
              type === 'eval'
                ? `if (sensor.total_consumption > 350) {\n  return 'foo';\n}\nreturn 'bar';`
                : undefined
            }
            value={evalExpression}
            onChange={({ target }) => setEvalExpression(target.value)}
            onBlur={() => props.onUpdate({ value: evalExpression })}
          />
        </Form.Item>
        {command?.valueType === 'eval' ? (
          <EvalHelp
            addVariable={variable =>
              setEvalExpression(evalExpression + variable)
            }
          />
        ) : undefined}
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
              value={command?.name}
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
