import { RoutineCommandTriggerRoutineDTO } from '@text-based/controller-shared';
import { Drawer, Spin } from 'antd';
import React from 'react';

type tState = {
  name: string;
};

export class TriggerRoutineCommand extends React.Component<
  { command?: RoutineCommandTriggerRoutineDTO },
  tState
> {
  override state = {} as tState;

  public getValue(): RoutineCommandTriggerRoutineDTO {
    return this.props.command;
  }

  override render() {
    if (!this.state) {
      return (
        <Drawer visible={false}>
          <Spin />
        </Drawer>
      );
    }
    return <></>;
  }
}
