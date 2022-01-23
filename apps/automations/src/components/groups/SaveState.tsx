import { GroupDTO } from '@text-based/controller-shared';
import { Card, Table } from 'antd';
import React from 'react';

export class GroupSaveStates extends React.Component<{ group: GroupDTO }> {
  override render() {
    return (
      <Card title="Save States" type="inner">
        <Table dataSource={this.props.group.save_states}>
          <Table.Column
            title="Friendly Name"
            dataIndex="friendlyName"
            key="friendlyName"
          ></Table.Column>
        </Table>
      </Card>
    );
  }
}
