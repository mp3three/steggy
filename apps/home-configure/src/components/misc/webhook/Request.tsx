import { RoutineCommandWebhookDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Empty, Form, Input, List, Select } from 'antd';

import { FD_ICONS } from '../../../types';
import { SecretsSuffix } from '../SecretsSuffix';
import { WebhookRequestHeader } from './Header';

export function WebhookRequestBuilder(props: {
  onUpdate?: (value: Partial<RoutineCommandWebhookDTO>) => void;
  webhook?: RoutineCommandWebhookDTO;
}) {
  return (
    <>
      <Form.Item label="URL" required>
        <Input
          placeholder="http://some.domain/api/target"
          defaultValue={props.webhook?.url}
          suffix={<SecretsSuffix />}
          onBlur={({ target }) => props.onUpdate({ url: target.value })}
        />
      </Form.Item>
      <Form.Item label="Method">
        <Select
          value={props.webhook?.method || 'get'}
          onChange={method => props.onUpdate({ method })}
        >
          <Select.Option value="get">GET</Select.Option>
          <Select.Option value="post">POST</Select.Option>
          <Select.Option value="put">PUT</Select.Option>
          <Select.Option value="delete">DELETE</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        label={
          <Button
            type={is.empty(props.webhook.headers) ? 'primary' : 'text'}
            size="small"
            onClick={() =>
              props.onUpdate({
                headers: [...props.webhook.headers, { header: '', value: '' }],
              })
            }
          >
            {FD_ICONS.get('list_add')} Headers
          </Button>
        }
      >
        {is.empty(props.webhook.headers) ? (
          <Empty description="No extra headers will be sent" />
        ) : (
          <List
            dataSource={props.webhook.headers.map((item, index) => ({
              ...item,
              index,
            }))}
            pagination={false}
            renderItem={item => (
              <WebhookRequestHeader
                header={item}
                onUpdate={update =>
                  props.onUpdate({
                    headers: props.webhook.headers.map((header, index) =>
                      index === item.index ? update : header,
                    ),
                  })
                }
                onRemove={() =>
                  props.onUpdate({
                    headers: props.webhook.headers.filter(
                      (header, index) => index !== item.index,
                    ),
                  })
                }
              />
            )}
          />
        )}
      </Form.Item>
    </>
  );
}
