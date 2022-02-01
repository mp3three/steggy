import { RoutineCommandSleepDTO } from '@text-based/controller-shared';
import { Drawer, Spin } from 'antd';
import React from 'react';

type tState = {
  name: string;
};

export class SleepCommand extends React.Component<
  { command?: RoutineCommandSleepDTO },
  tState
> {
  override state = {} as tState;

  public getValue(): RoutineCommandSleepDTO {
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
