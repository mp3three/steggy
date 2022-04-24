import {
  PersonDTO,
  RoomDTO,
  RoutineCommandWebhookDTO,
} from '@steggy/controller-shared';
import { Button, Form, Input, Select, Space, Table, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

type tState = {
  name: string;
  people: PersonDTO[];
  rooms: RoomDTO[];
};

export class WebhookRequest extends React.Component<
  {
    onUpdate?: (value: Partial<RoutineCommandWebhookDTO>) => void;
    webhook?: RoutineCommandWebhookDTO;
  },
  tState
> {
  override state = { people: [], rooms: [] } as tState;

  private get assignTarget() {
    const room = this.state.rooms.find(
      ({ _id }) => _id === this.props.webhook.assignTo,
    );
    if (room) {
      return room.metadata;
    }
    const person = this.state.people.find(
      ({ _id }) => _id === this.props.webhook.assignTo,
    );
    if (person) {
      return person.metadata;
    }
    return undefined;
  }

  override async componentDidMount(): Promise<void> {
    await this.refresh();
  }

  override render() {
    const parse = this.props.webhook?.parse ?? 'none';
    const target = this.assignTarget;
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="URL">
          <Input
            placeholder="http://some.domain/api/target"
            defaultValue={this.props.webhook?.url}
            onBlur={({ target }) => this.props.onUpdate({ url: target.value })}
          />
        </Form.Item>
        <Form.Item label="Method">
          <Select
            value={this.props.webhook?.method}
            onChange={method => this.props.onUpdate({ method })}
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
                this.props.onUpdate({
                  headers: [
                    ...(this.props.webhook?.headers ?? []),
                    { header: '', value: '' },
                  ],
                })
              }
            >
              Add
            </Button>
          </div>
          <Table dataSource={this.props.webhook?.headers ?? []}>
            <Table.Column
              title="Header"
              dataIndex="header"
              key="header"
              render={(i, record, index) => (
                <Input
                  value={i}
                  onChange={({ target }) =>
                    this.props.onUpdate({
                      headers: this.props.webhook?.headers.map(
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
                    this.props.onUpdate({
                      headers: this.props.webhook.headers.map(
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
          <Select
            value={parse}
            onChange={parse => this.props.onUpdate({ parse })}
          >
            <Select.Option value="none">Ignore</Select.Option>
            <Select.Option value="text">Text</Select.Option>
            <Select.Option value="json">JSON</Select.Option>
          </Select>
        </Form.Item>
        {parse === 'json' ? (
          <Form.Item label="Data Path">
            <Input
              placeholder="object.path.to.value"
              defaultValue={this.props.webhook?.objectPath}
              onBlur={({ target }) =>
                this.props.onUpdate({ objectPath: target.value })
              }
            />
          </Form.Item>
        ) : undefined}
        {parse === 'none' ? undefined : (
          <Form.Item label="Assign To">
            <Select
              value={this.props.webhook.assignTo}
              onChange={assignTo => this.assignTo(assignTo)}
            >
              <Select.OptGroup label="Room">
                {this.state.rooms.map(room => (
                  <Select.Option key={room._id} value={room._id}>
                    {room.friendlyName}
                  </Select.Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="Person">
                {this.state.people.map(person => (
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

  private assignTo(assignTo: string): void {
    const assignType = this.state.rooms.some(({ _id }) => _id === assignTo)
      ? 'room'
      : 'person';
    this.props.onUpdate({ assignTo, assignType });
  }

  private async refresh(): Promise<void> {
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
    this.setState({ people, rooms });
  }
}
