import {
  GroupDTO,
  RoutineCommandGroupStateDTO,
} from '@steggy/controller-shared';
import { Form, Select, Skeleton, Space } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';

export function GroupStateCommand(props: {
  command?: RoutineCommandGroupStateDTO;
  onUpdate: (command: Partial<RoutineCommandGroupStateDTO>) => void;
}) {
  const [groups, setGroups] = useState<GroupDTO[]>([]);

  const group = groups.find(({ _id }) => _id === props.command?.group);

  useEffect(() => {
    async function listGroups(): Promise<void> {
      const groups = await sendRequest<GroupDTO[]>({
        control: {
          select: [
            'friendlyName',
            'type',
            'save_states.id',
            'save_states.friendlyName',
          ],
          sort: ['type', 'friendlyName'],
        },
        url: `/group`,
      });
      setGroups(groups);
    }
    listGroups();
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item label="Group">
        <Select
          value={group?._id}
          onChange={group => props.onUpdate({ group })}
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
      <Form.Item label="Save State">
        {group ? (
          <Select
            value={props.command?.state}
            onChange={state => props.onUpdate({ state })}
          >
            {group.save_states.map(state => (
              <Select.Option key={state.id} value={state.id}>
                {state.friendlyName}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <Skeleton.Input active style={{ width: '200px' }} />
        )}
      </Form.Item>
    </Space>
  );
}
