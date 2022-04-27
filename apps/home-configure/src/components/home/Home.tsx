import { Col, Layout, Row } from 'antd';
import React from 'react';

import { RecentActivations } from './RecentActivations';

export class HomePage extends React.Component {
  override render() {
    return (
      <Layout>
        <Layout.Content style={{ padding: '16px' }}>
          <Row>
            <Col span={24}>
              <RecentActivations />
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}
