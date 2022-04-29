import { is } from '@steggy/utilities';
import { Card, Col, Form, Input, Layout, Row, Tabs } from 'antd';
import React, { useState } from 'react';

import { ADMIN_KEY, BASE_URL, sendRequest } from '../../types';
import { DebuggerSettings } from './DebuggerSettings';

export function SettingsPage(props: {
  onConnectionUpdate?: (properties: {
    ADMIN_KEY?: string;
    BASE_URL?: string;
  }) => void;
}) {
  const [BASE, setBase] = useState<string>(sendRequest.BASE_URL);
  const [KEY, setKey] = useState<string>(sendRequest.ADMIN_KEY);

  function baseUrlUpdate(BASE: string): void {
    setBase(BASE);
    if (props.onConnectionUpdate) {
      props.onConnectionUpdate({ BASE_URL: BASE });
    }
    sendRequest.BASE_URL = BASE;
    localStorage.setItem(BASE_URL, BASE);
  }

  function passwordUpdate(KEY: string): void {
    setKey(KEY);
    if (props.onConnectionUpdate) {
      props.onConnectionUpdate({ ADMIN_KEY: KEY });
    }
    sendRequest.ADMIN_KEY = KEY;
    localStorage.setItem(ADMIN_KEY, KEY);
  }

  return (
    <Layout style={{ height: '100%' }}>
      <Layout.Content style={{ height: '100%', padding: '16px' }}>
        <Tabs
          tabPosition="left"
          style={{ marginTop: '16px', minHeight: '50%' }}
        >
          <Tabs.TabPane key="connection" tab="Connection">
            <Row>
              <Col span={12}>
                <Card title="Connection Settings" type="inner">
                  <Form.Item label="Server Admin Key">
                    <Input.Password
                      defaultValue={KEY}
                      onBlur={({ target }) => passwordUpdate(target.value)}
                    />
                  </Form.Item>
                  <Form.Item label="Server Base URL">
                    <Input
                      placeholder="Leave blank for same domain / default operation"
                      defaultValue={BASE}
                      onBlur={({ target }) => baseUrlUpdate(target.value)}
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane key="debugger" tab="Debugger" disabled={is.empty(KEY)}>
            <DebuggerSettings />
          </Tabs.TabPane>
        </Tabs>
      </Layout.Content>
    </Layout>
  );
}
