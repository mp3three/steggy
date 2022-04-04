import InformationIcon from '@2fd/ant-design-icons/lib/Information';
import {
  RoomDTO,
  RoomMetadataDTO,
  SetRoomMetadataCommandDTO,
} from '@automagical/controller-shared';
import { EMPTY, is, SINGLE } from '@automagical/utilities';
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
import React from 'react';

import { sendRequest } from '../../../types';
import { ChronoExamples } from '../../misc';

type tState = {
  rooms: Pick<RoomDTO, '_id' | 'friendlyName' | 'metadata'>[];
};

export class RoomSetMetadataCommand extends React.Component<
  {
    command?: SetRoomMetadataCommandDTO;
    onUpdate: (command: Partial<SetRoomMetadataCommandDTO>) => void;
  },
  tState
> {
  override state = { rooms: [] } as tState;

  private get room(): RoomDTO {
    return this.state.rooms.find(({ _id }) => _id === this.props.command?.room);
  }

  private get value() {
    const room = this.room;
    return room.metadata.find(({ name }) => name === this.props.command.name)
      .value;
  }

  override async componentDidMount(): Promise<void> {
    await this.listRooms();
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Room">
          <Select
            value={this.room?._id}
            onChange={room => this.props.onUpdate({ room })}
            showSearch
            style={{ width: '100%' }}
          >
            {this.state.rooms.map(group => (
              <Select.Option key={group._id} value={group._id}>
                {group.friendlyName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Property">
          {this.room ? (
            is.empty(this.room.metadata) ? (
              <Typography.Text type="warning">
                Room does not have metadata
              </Typography.Text>
            ) : (
              <Select
                value={this.props.command?.name}
                onChange={name => this.props.onUpdate({ name })}
              >
                {(this.room.metadata ?? []).map(state => (
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
        <Form.Item label="Value">{this.renderValue()}</Form.Item>
      </Space>
    );
  }

  private async listRooms(): Promise<void> {
    const rooms = await sendRequest<RoomDTO[]>({
      control: {
        select: ['friendlyName', 'metadata'],
        sort: ['friendlyName'],
      },
      url: `/room`,
    });
    this.setState({ rooms });
  }

  private renderValue() {
    if (!this.room || is.empty(this.room.metadata)) {
      return <Skeleton.Input active />;
    }
    const metadata = this.room.metadata.find(
      ({ name }) => name === this.props.command.name,
    );
    if (!metadata) {
      return <Skeleton.Input active />;
    }
    if (metadata.type === 'boolean') {
      return this.renderValueBoolean();
    }
    if (metadata.type === 'enum') {
      return this.renderValueEnum(metadata);
    }
    if (metadata.type === 'string') {
      return this.renderValueString();
    }
    if (metadata.type === 'number') {
      return this.renderValueNumber();
    }
    if (metadata.type === 'date') {
      return this.renderValueDate();
    }
    return undefined;
  }

  private renderValueBoolean() {
    return (
      <Radio.Group
        value={this.props.command.value ?? 'toggle'}
        onChange={({ target }) => this.props.onUpdate({ value: target.value })}
      >
        <Radio.Button value={true}>Checked</Radio.Button>
        <Radio.Button value={false}>Unchecked</Radio.Button>
        <Radio.Button value={`toggle`}>Toggle</Radio.Button>
      </Radio.Group>
    );
  }

  private renderValueDate() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="tomorrow"
          defaultValue={String(this.props.command.value)}
          onBlur={({ target }) => this.props.onUpdate({ value: target.value })}
        />
        <Typography.Paragraph>
          {ChronoExamples.renderDateExpression(
            this.props.command.value as string,
          )}
        </Typography.Paragraph>
        <ChronoExamples />
      </Space>
    );
  }

  private renderValueEnum(metadata: RoomMetadataDTO) {
    return (
      <Select
        value={this.props.command.value}
        onChange={(value: string) => this.props.onUpdate({ value })}
      >
        {metadata.options.map(option => (
          <Select.Option value={option} key={option}>
            {option}
          </Select.Option>
        ))}
      </Select>
    );
  }

  private renderValueNumber() {
    const exampleA = `${this.props.command.name} + 5`;
    const nodeA = parse(exampleA);
    const exampleB = `cos(45 deg)`;
    const nodeB = parse(exampleB);
    const value = this.value;
    const currentValue = is.number(value) ? value : EMPTY;

    return (
      <Space direction="vertical">
        <Radio.Group
          value={this.props.command?.type ?? 'set_value'}
          onChange={({ target }) => this.props.onUpdate({ type: target.value })}
        >
          <Radio.Button value="set_value">Set value</Radio.Button>
          <Radio.Button value="increment">Increment</Radio.Button>
          <Radio.Button value="decrement">Decrement</Radio.Button>
          <Radio.Button value="formula">Formula</Radio.Button>
        </Radio.Group>
        {this.props.command?.type === 'formula' ? (
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ textAlign: 'right' }}>
              <Tooltip
                title={
                  <Typography>
                    <Typography.Title level={4}>Overview</Typography.Title>
                    <Typography.Paragraph>
                      Enter a math expression, the result will be set as the new
                      metadata value.
                    </Typography.Paragraph>
                    <Typography.Title level={4}>Examples</Typography.Title>
                    <Typography.Paragraph>
                      <Typography.Text code>{exampleA}</Typography.Text>=
                      <Typography.Text code>
                        {String(
                          nodeA.evaluate({
                            [this.props.command.name]: currentValue,
                          }),
                        )}
                      </Typography.Text>
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                      <Typography.Text code>{exampleB}</Typography.Text>=
                      <Typography.Text code>
                        {String(
                          nodeB.evaluate({
                            [this.props.command.name]: currentValue,
                          }),
                        )}
                      </Typography.Text>
                    </Typography.Paragraph>
                  </Typography>
                }
              >
                <InformationIcon />
              </Tooltip>
            </div>
            <Input.TextArea
              style={{ width: '100%' }}
              defaultValue={String(this.props.command?.value)}
              onBlur={({ target }) =>
                this.props.onUpdate({ value: target.value })
              }
            />
          </Space>
        ) : (
          <Input
            type="number"
            value={Number(this.props.command.value ?? SINGLE)}
            onChange={({ target }) =>
              this.props.onUpdate({ value: target.value })
            }
          />
        )}
      </Space>
    );
  }

  private renderValueString() {
    return (
      <Input
        value={String(this.props.command.value ?? '')}
        onChange={({ target }) => this.props.onUpdate({ value: target.value })}
      />
    );
  }
}
