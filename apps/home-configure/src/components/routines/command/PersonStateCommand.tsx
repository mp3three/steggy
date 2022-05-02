import {
  PersonDTO,
  RoutineCommandPersonStateDTO,
} from '@steggy/controller-shared';
import { Form, Select, Skeleton, Space } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';

export function PersonStateCommand(props: {
  command?: RoutineCommandPersonStateDTO;
  onUpdate: (command: Partial<RoutineCommandPersonStateDTO>) => void;
}) {
  const [people, setPeople] = useState<PersonDTO[]>([]);

  const person = people.find(({ _id }) => _id === props.command?.person);

  useEffect(() => {
    async function listPeople(): Promise<void> {
      const people = await sendRequest<PersonDTO[]>({
        control: {
          select: [
            'friendlyName',
            'save_states.id',
            'save_states.friendlyName',
          ],
          sort: ['friendlyName'],
        },
        url: `/person`,
      });
      setPeople(people);
    }
    listPeople();
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Form.Item label="Person">
        <Select
          value={person?._id}
          onChange={person => props.onUpdate({ person })}
          showSearch
          style={{ width: '100%' }}
        >
          {people.map(group => (
            <Select.Option key={group._id} value={group._id}>
              {group.friendlyName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Save State">
        {person ? (
          <Select
            value={props.command?.state}
            onChange={state => props.onUpdate({ state })}
          >
            {person.save_states.map(state => (
              <Select.Option key={state.id} value={state.id}>
                {state.friendlyName}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <Skeleton.Input style={{ width: '200px' }} active />
        )}
      </Form.Item>
    </Space>
  );
}
