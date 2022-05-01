import { Col, Layout, Row } from 'antd';
import React from 'react';

import { PinnedItems } from './PinnedItems';
import { RecentActivations } from './RecentActivations';

export function HomePage() {
  return (
    <Layout>
      <Layout.Content style={{ padding: '16px' }}>
        <Row gutter={[8, 32]}>
          <Col span={20} offset={2}>
            <RecentActivations />
          </Col>
          <Col span={10} offset={2}>
            <PinnedItems />
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
}
