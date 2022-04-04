import { Skeleton } from 'antd';
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
    return <Skeleton />;
  }
}
