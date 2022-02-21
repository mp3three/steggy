import { HTTP_METHODS } from '@automagical/boilerplate';
import { RoutineCommandWebhookDTO } from '@automagical/controller-shared';
import { Form, Input, Radio } from 'antd';
import React from 'react';

type tState = {
  method: HTTP_METHODS;
  url: string;
};

export class WebhookCommand extends React.Component<
  { command?: RoutineCommandWebhookDTO },
  tState
> {
  override state = { method: 'get' } as tState;

  override componentDidMount(): void {
    const { command } = this.props;
    this.load(command);
  }

  public getValue(): RoutineCommandWebhookDTO {
    return {
      method: this.state.method,
      url: this.state.url,
    };
  }

  public load({ url, method }: Partial<RoutineCommandWebhookDTO> = {}): void {
    this.setState({ url, method });
  }

  override render() {
    return (
      <>
        <Form.Item label="Method">
          <Radio.Group value={this.state.method}>
            <Radio.Button value="get">GET</Radio.Button>
            <Radio.Button value="post">POST</Radio.Button>
            <Radio.Button value="put">PUT</Radio.Button>
            <Radio.Button value="delete">DELETE</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="URL">
          <Input
            value={this.state.url}
            onChange={({ target }) => this.setState({ url: target.value })}
            placeholder="http://some.domain/webhook/target"
          />
        </Form.Item>
      </>
    );
  }
}
