import { is } from '@steggy/utilities';
import { Card, Col, Form, Input, Layout, Row, Tabs } from 'antd';
import React from 'react';

import { ADMIN_KEY, BASE_URL, sendRequest } from '../../types';
import { IntegrationSettings } from './IntegrationSettings';

type tState = {
  BASE: string;
  KEY: string;
};

export class SettingsPage extends React.Component<
  {
    onConnectionUpdate?: (properties: {
      ADMIN_KEY?: string;
      BASE_URL?: string;
    }) => void;
  },
  tState
> {
  override state = {} as tState;

  override componentDidMount(): void {
    this.setState({ BASE: sendRequest.BASE_URL, KEY: sendRequest.ADMIN_KEY });
  }

  override render() {
    return (
      <Layout>
        <Layout.Content style={{ padding: '16px' }}>
          <Tabs tabPosition="left" style={{ marginTop: '16px' }}>
            <Tabs.TabPane key="General" tab="General">
              <Row>
                <Col span={12}>
                  <Card title="Connection Settings" type="inner">
                    <Form.Item label="Server Admin Key">
                      <Input.Password
                        value={this.state.KEY}
                        onChange={({ target }) =>
                          this.passwordUpdate(target.value)
                        }
                      />
                    </Form.Item>
                    <Form.Item label="Server Base URL">
                      <Input
                        placeholder="Leave blank for same domain / default operation"
                        value={this.state.BASE}
                        onChange={({ target }) =>
                          this.baseUrlUpdate(target.value)
                        }
                      />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Tabs.TabPane>
            <Tabs.TabPane
              key="Integrations"
              tab="Integrations"
              disabled={is.empty(this.state.KEY)}
            >
              <IntegrationSettings />
            </Tabs.TabPane>
          </Tabs>
        </Layout.Content>
      </Layout>
    );
  }

  private baseUrlUpdate(BASE: string): void {
    this.setState({ BASE });
    if (this.props.onConnectionUpdate) {
      this.props.onConnectionUpdate({ BASE_URL: BASE });
    }
    sendRequest.BASE_URL = BASE;
    localStorage.setItem(BASE_URL, BASE);
  }

  private passwordUpdate(KEY: string): void {
    this.setState({ KEY });
    if (this.props.onConnectionUpdate) {
      this.props.onConnectionUpdate({ ADMIN_KEY: KEY });
    }
    sendRequest.ADMIN_KEY = KEY;
    localStorage.setItem(ADMIN_KEY, KEY);
  }
}
