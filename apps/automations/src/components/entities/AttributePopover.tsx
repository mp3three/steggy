import { HassStateDTO } from '@text-based/home-assistant-shared';
import { Space, Table, Typography } from 'antd';
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
    const attributes = this.props.state.attributes;
    const data = Object.keys(attributes).map(key => ({
      key,
      value: attributes[key],
    }));
    return (
      <Space direction="vertical">
        <Typography.Text>State: {this.props.state.state}</Typography.Text>
        <Table dataSource={data}>
          <Table.Column key="key" title="key" dataIndex="key" />
          <Table.Column key="value" title="value" dataIndex="value" />
        </Table>
      </Space>
    );
  }
}
