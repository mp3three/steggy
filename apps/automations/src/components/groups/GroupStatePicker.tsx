import { GroupDTO, GroupSaveStateDTO } from '@automagical/controller-shared';
import { LightAttributesDTO } from '@automagical/home-assistant-shared';
import { TitleCase } from '@automagical/utilities';
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
