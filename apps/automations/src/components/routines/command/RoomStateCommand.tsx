import { RoutineCommandRoomStateDTO } from '@text-based/controller-shared';
import { Drawer, Spin } from 'antd';
import React from 'react';

type tState = {
  name: string;
};

export class RoomStateCommand extends React.Component<
  { command?: RoutineCommandRoomStateDTO },
  tState
> {
  override state = {} as tState;

  public getValue(): RoutineCommandRoomStateDTO {
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
