import { RoomEntitySaveStateDTO } from '@text-based/controller-shared';
import { Drawer, Spin } from 'antd';
import React from 'react';

type tState = {
  name: string;
};

export class EntityStateCommand extends React.Component<
  { command?: RoomEntitySaveStateDTO },
  tState
> {
  override state = {} as tState;

  public getValue(): RoomEntitySaveStateDTO {
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
