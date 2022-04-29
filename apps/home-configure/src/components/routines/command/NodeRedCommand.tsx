import { RoutineCommandNodeRedDTO } from '@steggy/controller-shared';
import { Select, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';

export function NodeRedCommand(props: {
  command?: RoutineCommandNodeRedDTO;
  onUpdate: (command: Partial<RoutineCommandNodeRedDTO>) => void;
}) {
  const [targets, setTargets] = useState<Record<'id' | 'name', string>[]>([]);

  useEffect(() => {
    async function refresh(): Promise<void> {
      const targets = await sendRequest<{
        list: Record<'id' | 'name', string>[];
      }>({
        url: `/debug/node-red/commands`,
      });
      setTargets(targets.list);
    }
    refresh();
  }, []);

  return (
    <Space direction="vertical">
      <Select
        style={{ width: '250px' }}
        value={props.command?.name}
        onChange={name => props.onUpdate({ name })}
      >
        {targets.map(target => (
          <Select.Option key={target.id} value={target.id}>
            {target.name}
          </Select.Option>
        ))}
      </Select>
      <Typography.Text type="secondary">
        Action associated with node id
      </Typography.Text>
    </Space>
  );
}
