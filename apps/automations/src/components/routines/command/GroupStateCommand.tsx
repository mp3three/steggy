import { RoutineCommandGroupStateDTO } from '@text-based/controller-shared';
import { Drawer, Spin } from 'antd';
import React from 'react';

type tState = {
  name: string;
};

export class GroupStateCommand extends React.Component<
  { command?: RoutineCommandGroupStateDTO },
  tState
> {
  override state = {} as tState;

  public getValue(): RoutineCommandGroupStateDTO {
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
