import { Drawer, Spin } from 'antd';
import React from 'react';

type tState = {
  name: string;
};

export class EmptyComponent extends React.Component<
  { prop?: unknown },
  tState
> {
  override state = {} as tState;

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
