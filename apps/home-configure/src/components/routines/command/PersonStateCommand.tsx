import {
  PersonDTO,
  RoutineCommandPersonStateDTO,
} from '@steggy/controller-shared';
import { Form, Select, Skeleton, Space } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  people: PersonDTO[];
};

export class PersonStateCommand extends React.Component<
  {
    command?: RoutineCommandPersonStateDTO;
    onUpdate: (command: Partial<RoutineCommandPersonStateDTO>) => void;
  },
  tState
> {
  override state = { people: [] } as tState;

  private get person(): PersonDTO {
    return this.state.people.find(
      ({ _id }) => _id === this.props.command?.person,
    );
  }

  override async componentDidMount(): Promise<void> {
    await this.listPeople();
  }

  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Form.Item label="Person">
          <Select
            value={this.person?._id}
            onChange={person => this.props.onUpdate({ person })}
            showSearch
            style={{ width: '100%' }}
          >
            {this.state.people.map(group => (
              <Select.Option key={group._id} value={group._id}>
                {group.friendlyName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Save State">
          {this.person ? (
            <Select
              value={this.props.command?.state}
              onChange={state => this.props.onUpdate({ state })}
            >
              {this.person.save_states.map(state => (
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

  private async listPeople(): Promise<void> {
    const people = await sendRequest<PersonDTO[]>({
      control: {
        select: ['friendlyName', 'save_states.id', 'save_states.friendlyName'],
        sort: ['friendlyName'],
      },
      url: `/person`,
    });
    this.setState({ people });
  }
}
