import {
  RoutineCommandTriggerRoutineDTO,
  RoutineDTO,
} from '@text-based/controller-shared';
import { Form, Select } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';

type tState = {
  routine: string;
  routines: RoutineDTO[];
};

export class TriggerRoutineCommand extends React.Component<
  { command?: RoutineCommandTriggerRoutineDTO },
  tState
> {
  override state = {
    routines: [],
  } as tState;

  override async componentDidMount(): Promise<void> {
    await this.listRoutines();
    const { command } = this.props;
    if (command) {
      this.setState({ routine: command.routine });
    }
  }

  public getValue(): RoutineCommandTriggerRoutineDTO {
    return this.props.command;
  }

  override render() {
    return (
      <Form.Item label="Routine">
        <Select onChange={routine => this.setState({ routine })}>
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
    const routines = await sendRequest<RoutineDTO[]>(
      `/routine?select=friendlyName`,
    );
    this.setState({ routines });
  }
}
