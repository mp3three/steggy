import { Breadcrumb, Card, Col, Form, Input, Layout, Row } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

type tState = {
  name: string;
};

export class SettingsPage extends React.Component<{ prop?: unknown }, tState> {
  override state = {} as tState;

  override render() {
    return (
      <Layout>
        <Layout.Content style={{ padding: '16px' }}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/settings">Settings</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <Row style={{ marginTop: '16px' }}>
            <Col span={12}>
              <Card title="Settings">
                <Form.Item label="Server Admin Key">
                  <Input.Password />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }
}
