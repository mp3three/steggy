import { Breadcrumb, Card, Col, Form, Input, Layout, Row } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

import { ADMIN_KEY, BASE_URL, sendRequest } from '../../types';

type tState = {
  BASE: string;
  KEY: string;
};

export class SettingsPage extends React.Component<{ prop?: unknown }, tState> {
  override state = {} as tState;

  override componentDidMount(): void {
    this.setState({ BASE: sendRequest.BASE_URL, KEY: sendRequest.ADMIN_KEY });
  }

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
              <Card title="Connection Settings">
                <Form.Item label="Server Admin Key">
                  <Input.Password
                    value={this.state.KEY}
                    onChange={({ target }) => this.passwordUpdate(target.value)}
                  />
                </Form.Item>
                <Form.Item label="Server Base URL">
                  <Input
                    placeholder="Leave blank for same domain / default operation"
                    value={this.state.BASE}
                    onChange={({ target }) => this.baseUrlUpdate(target.value)}
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Layout.Content>
      </Layout>
    );
  }

  private baseUrlUpdate(BASE): void {
    this.setState({ BASE });
    sendRequest.BASE_URL = BASE;
    localStorage.setItem(BASE_URL, BASE);
  }

  private passwordUpdate(KEY: string): void {
    this.setState({ KEY });
    sendRequest.ADMIN_KEY = KEY;
    localStorage.setItem(ADMIN_KEY, KEY);
  }
}
