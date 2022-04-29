import { RoutineWebhookComparisonDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Card, Divider, Form, Input, Radio } from 'antd';
import React from 'react';

import { CompareValue } from '../CompareValue';
import { WebhookRequest } from '../WebhookRequest';

export function WebhookComparison(props: {
  comparison: RoutineWebhookComparisonDTO;
  onUpdate: (comparison: RoutineWebhookComparisonDTO) => void;
}) {
  function emit(value: Partial<RoutineWebhookComparisonDTO>) {
    props.onUpdate({
      ...props.comparison,
      ...value,
    });
  }

  return (
    <>
      <Card type="inner" title="Webhook Comparison">
        <WebhookRequest
          webhook={props.comparison?.webhook}
          onUpdate={webhook =>
            emit({
              webhook: {
                ...props.comparison?.webhook,
                ...webhook,
              },
            })
          }
        />
        <Divider orientation="left">Response</Divider>
        <Form.Item label="Handle As">
          <Radio.Group
            buttonStyle="solid"
            value={props.comparison?.handleAs}
            onChange={({ target }) => emit({ handleAs: target.value })}
          >
            <Radio.Button value="json">JSON</Radio.Button>
            <Radio.Button value="text">Text</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Object Path">
          <Input
            defaultValue={props.comparison.property}
            onBlur={({ target }) => emit({ property: target.value })}
          />
        </Form.Item>
        <Divider orientation="left">Comparison</Divider>
        <CompareValue
          operation={props.comparison?.operation}
          value={props.comparison?.value as string | string[]}
          onUpdate={({ value, operation }) => {
            if (!is.undefined(value)) {
              emit({ value });
            }
            if (!is.undefined(operation)) {
              emit({ operation });
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
