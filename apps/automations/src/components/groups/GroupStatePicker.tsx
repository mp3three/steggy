import { GroupDTO, GroupSaveStateDTO } from '@text-based/controller-shared';
import { LightAttributesDTO } from '@text-based/home-assistant-shared';
import { TitleCase } from '@text-based/utilities';
import { Card, Table, Typography } from 'antd';
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
