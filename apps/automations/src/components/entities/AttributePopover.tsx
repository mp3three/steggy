import { HassStateDTO } from '@text-based/home-assistant-shared';
import { is } from '@text-based/utilities';
import { Popover, Table, Typography } from 'antd';
import React from 'react';

type tStateType = {
  friendly_name?: string;
  state?: string;
};

export class EntityAttributePopover extends React.Component<
  {
    state: HassStateDTO;
  },
  tStateType
> {
  override render() {
    const data = Object.keys(this.props.state.attributes).map(key => ({
      key,
      value: data[key],
    }));
    const { friendly_name, state } = this.state;
    return <Table></Table>;
  }
}
