import { RoutineWebhookComparisonDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Card, Divider, Form, Input, Radio } from 'antd';
import React from 'react';

import { CompareValue } from '../CompareValue';
import { WebhookRequest } from '../WebhookRequest';

export class WebhookComparison extends React.Component<{
  comparison: RoutineWebhookComparisonDTO;
  onUpdate: (comparison: RoutineWebhookComparisonDTO) => void;
}> {
  override render() {
    return (
      <>
        <Card type="inner" title="Webhook Comparison">
          <WebhookRequest
            webhook={this.props.comparison?.webhook}
            onUpdate={webhook =>
              this.emit({
                webhook: {
                  ...this.props.comparison?.webhook,
                  ...webhook,
                },
              })
            }
          />
          <Divider orientation="left">Response</Divider>
          <Form.Item label="Handle As">
            <Radio.Group
              buttonStyle="solid"
              value={this.props.comparison?.handleAs}
              onChange={({ target }) => this.emit({ handleAs: target.value })}
            >
              <Radio.Button value="json">JSON</Radio.Button>
              <Radio.Button value="text">Text</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Object Path">
            <Input
              defaultValue={this.props.comparison.property}
              onBlur={({ target }) => this.emit({ property: target.value })}
            />
          </Form.Item>
          <Divider orientation="left">Comparison</Divider>
          <CompareValue
            operation={this.props.comparison?.operation}
            value={this.props.comparison?.value as string | string[]}
            onUpdate={({ value, operation }) => {
              if (!is.undefined(value)) {
                this.emit({ value });
              }
              if (!is.undefined(operation)) {
                this.emit({ operation });
              }
            }}
          />
        </Card>
        <Card
          type="inner"
          title="Webhook Output"
          style={{ marginTop: '16px' }}
          extra={
            <Button type="primary" size="small">
              Test
            </Button>
          }
        ></Card>
      </>
    );
  }

  private emit(value: Partial<RoutineWebhookComparisonDTO>) {
    this.props.onUpdate({
      ...this.props.comparison,
      ...value,
    });
  }
}
