import { RoutineCommandSendNotificationDTO } from '@text-based/controller-shared';
import { Drawer, Spin } from 'antd';
import React from 'react';

type tState = {
  name: string;
};

export class SendNotificationCommand extends React.Component<
  { command?: RoutineCommandSendNotificationDTO },
  tState
> {
  override state = {} as tState;

  public getValue(): RoutineCommandSendNotificationDTO {
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
