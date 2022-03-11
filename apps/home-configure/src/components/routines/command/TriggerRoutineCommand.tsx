import {
  RoutineCommandTriggerRoutineDTO,
  RoutineDTO,
} from '@automagical/controller-shared';
import { Form, Select } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  routines: RoutineDTO[];
};

export class TriggerRoutineCommand extends React.Component<
  {
    command?: RoutineCommandTriggerRoutineDTO;
    onUpdate: (command: Partial<RoutineCommandTriggerRoutineDTO>) => void;
  },
  tState
> {
  override state = {
    routines: [],
  } as tState;

  override async componentDidMount(): Promise<void> {
    await this.listRoutines();
  }

  override render() {
    return (
      <Form.Item label="Routine">
        <Select
          value={this.props.command?.routine}
          onChange={routine => this.props.onUpdate({ routine })}
        >
          {this.state.routines.map(routine => (
            <Select.Option key={routine._id} value={routine._id}>
              {routine.friendlyName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    );
  }

  private async listRoutines(): Promise<void> {
    const routines = await sendRequest<RoutineDTO[]>({
      control: {
        select: ['friendlyName'],
        sort: ['friendlyName'],
      },
      url: `/routine`,
    });
    this.setState({ routines });
  }
}
