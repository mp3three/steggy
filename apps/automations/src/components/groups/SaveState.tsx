import { CameraOutlined, FolderAddOutlined } from '@ant-design/icons';
import { GroupDTO } from '@text-based/controller-shared';
import { is } from '@text-based/utilities';
import { Button, Card, Empty, Space, Table } from 'antd';
import React from 'react';

export class GroupSaveStates extends React.Component<{ group: GroupDTO }> {
  override render() {
    return (
      <Card
        title="Save States"
        key="states"
        style={{ margin: '8px 0' }}
        extra={
          <Space>
            <Button
              size="small"
              icon={<CameraOutlined />}
              onClick={this.captureCurrent.bind(this)}
            >
              Capture current
            </Button>
            <Button
              size="small"
              icon={<FolderAddOutlined />}
              onClick={this.createNewState.bind(this)}
            >
              Create new
            </Button>
          </Space>
        }
      >
        {is.empty(this.props.group.save_states) ? (
          <Empty description="No save states" />
        ) : (
          <Table dataSource={this.props.group.save_states}>
            <Table.Column
              title="Friendly Name"
              dataIndex="friendlyName"
              key="friendlyName"
            ></Table.Column>
          </Table>
        )}
      </Card>
    );
  }

  private captureCurrent(): void {
    //
  }

  private createNewState(): void {
    //
  }
}
