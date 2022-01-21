import { Space, Typography } from 'antd';
import React from 'react';
const { Title, Text } = Typography;

export class GroupList extends React.Component {
  override state: { groups: unknown[] } = {
    groups: [],
  };

  override render() {
    return (
      <>
        <Title level={3}>Group List</Title>
        <Space>
          <Text>Test</Text>
        </Space>
      </>
    );
  }
}
