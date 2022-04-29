import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Divider, Empty, Form, Skeleton, Space } from 'antd';
import React, { useEffect, useState } from 'react';

import { domain, sendRequest } from '../../../types';
import {
  FanEntityCard,
  LightEntityCard,
  SwitchEntityCard,
} from '../../entities';
import { FuzzySelect } from '../../misc';

export function EntityStateCommand(props: {
  command: GeneralSaveStateDTO;
  onUpdate: (command: Partial<GeneralSaveStateDTO>) => void;
}) {
  const [entities, setEntities] = useState<string[]>([]);

  // override async componentDidMount(): Promise<void> {
  //   await this.listEntities();
  // }

  useEffect(() => {
    async function listEntities(): Promise<void> {
      const entities = await sendRequest<string[]>({ url: `/entity/list` });
      setEntities(
        entities.filter(i =>
          ['light', 'switch', 'fan', 'media_player', 'lock'].includes(
            domain(i),
          ),
        ),
      );
    }
    listEntities();
  }, []);

  function renderPicker() {
    if (is.empty(props.command?.ref)) {
      return <Empty />;
    }
    switch (domain(props.command?.ref)) {
      case 'light':
        return (
          <LightEntityCard
            onUpdate={update => props.onUpdate(update)}
            state={props.command}
          />
        );
      case 'media_player':
      case 'switch':
        return (
          <SwitchEntityCard
            onUpdate={update => props.onUpdate(update)}
            state={props.command}
          />
        );
      case 'fan':
        return (
          <FanEntityCard
            relative
            onUpdate={update => props.onUpdate(update)}
            state={props.command}
          />
        );
    }
    return <Skeleton />;
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item label="Entity">
        <FuzzySelect
          value={props.command?.ref}
          onChange={reference => props.onUpdate({ ref: reference })}
          style={{ width: '100%' }}
          data={entities.map(i => ({ text: i, value: i }))}
        />
      </Form.Item>
      <Divider orientation="left">State</Divider>
      {renderPicker()}
    </Space>
  );
}
