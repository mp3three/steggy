import { RoutineCommandWebhookDTO } from '@automagical/controller-shared';
import { Button, Form, Input, Select, Table } from 'antd';
import React from 'react';

type tState = {
  name: string;
};

export class WebhookRequest extends React.Component<
  {
    onUpdate?: (value: Partial<RoutineCommandWebhookDTO>) => void;
    webhook?: RoutineCommandWebhookDTO;
  },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <>
        <Form.Item label="URL">
          <Input
            placeholder="http://some.domain/api/target"
            value={this.props.webhook?.url}
            onChange={({ target }) =>
              this.props.onUpdate({ url: target.value })
            }
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
                  value={i}
                  onChange={({ target }) =>
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
      </>
    );
  }
}
