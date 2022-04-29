import {
  GroupDTO,
  RoutineCommandGroupActionDTO,
} from '@steggy/controller-shared';
import { TitleCase } from '@steggy/utilities';
import { Empty, Form, Select, Space } from 'antd';
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';
import { LightGroupAction } from '../../groups';

export function GroupActionCommand(props: {
  command?: RoutineCommandGroupActionDTO;
  onUpdate: (command: Partial<RoutineCommandGroupActionDTO>) => void;
}) {
  const [groups, setGroups] = useState<GroupDTO[]>([]);

  const group = groups.find(({ _id }) => _id === props.command?.group);

  useEffect(() => {
    async function listGroups(): Promise<void> {
      const groups = await sendRequest<GroupDTO[]>({
        control: {
          filters: new Set([{ field: 'type', value: 'light' }]),
          select: ['friendlyName', 'type'],
          sort: ['friendlyName'],
        },
        url: `/group`,
      });
      setGroups(groups);
    }
    listGroups();
  }, []);

  function groupChange(group: string): void {
    props.onUpdate({
      group,
    });
  }

  function renderPicker() {
    if (!group) {
      return <Empty description="Select group" />;
    }
    if (group.type === 'light') {
      return (
        <LightGroupAction
          onUpdate={part => props.onUpdate(part)}
          command={
            props.command as RoutineCommandGroupActionDTO<{
              brightness: number;
            }>
          }
        />
      );
    }
    return (
      <Empty
        description={`${TitleCase(
          group.type,
        )} group does not have special actions`}
      />
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item>
        <Select
          value={group?._id}
          onChange={item => groupChange(item)}
          showSearch
          style={{ width: '100%' }}
        >
          {groups.map(group => (
            <Select.Option key={group._id} value={group._id}>
              {group.friendlyName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {renderPicker()}
    </Space>
  );
}
