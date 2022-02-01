import { RoutineCommandGroupActionDTO } from '@text-based/controller-shared';
import { Drawer, Spin } from 'antd';
import React from 'react';

type tState = {
  name: string;
};

export class GroupActionCommand extends React.Component<
  { command?: RoutineCommandGroupActionDTO },
  tState
> {
  override state = {} as tState;

  public getValue(): RoutineCommandGroupActionDTO {
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
