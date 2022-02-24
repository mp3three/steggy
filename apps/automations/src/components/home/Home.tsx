import { Card, Col, Layout, Row, Skeleton } from 'antd';
import React from 'react';

export class HomePage extends React.Component {
  override render() {
    return (
      <Layout>
        <Layout.Content style={{ padding: '16px' }}>
          <Row>
            <Col span={12}>
              <Card title="Quick Access">
                <Skeleton />
              </Card>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}
