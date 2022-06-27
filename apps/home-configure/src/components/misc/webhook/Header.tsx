import { WebhookHeaderDTO } from '@steggy/controller-shared';
import { Button, Input, List } from 'antd';
import { useEffect, useState } from 'react';

import { SecretsSuffix } from '../SecretsSuffix';

export function WebhookRequestHeader(props: {
  header: WebhookHeaderDTO;
  onRemove: () => void;
  onUpdate: (update: { header: string; value: string }) => void;
}) {
  const [value, setValue] = useState<string>(props.header.value);
  const [header, setHeader] = useState<string>(props.header.header);

  useEffect(() => {
    setValue(props.header.value);
    setHeader(props.header.header);
  }, [props.header]);

  return (
    <List.Item>
      <List.Item.Meta
        title={
          <Input
            value={header}
            size="small"
            placeholder="header-name"
            onChange={({ target }) => setHeader(target.value)}
            onBlur={() => props.onUpdate({ header, value })}
          />
        }
        description={
          <Input
            value={value}
            size="small"
            placeholder="value"
            onChange={({ target }) => setValue(target.value)}
            onBlur={() => props.onUpdate({ header, value })}
            suffix={<SecretsSuffix />}
          />
        }
      />
      <Button danger type="text" size="small" onClick={() => props.onRemove()}>
        X
      </Button>
    </List.Item>
  );
}
