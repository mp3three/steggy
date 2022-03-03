import { GroupDTO } from '@automagical/controller-shared';
import { Card } from 'antd';
import React from 'react';

type tStateType = { group: GroupDTO };

export class GroupStatePicker extends React.Component<
  { group: GroupDTO },
  tStateType
> {
  override render() {
    return <Card title={this.props.group.friendlyName + ' save states'}></Card>;
  }
}
