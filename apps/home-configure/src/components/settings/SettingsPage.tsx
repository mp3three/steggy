import { is } from '@steggy/utilities';
import {
  Card,
  Col,
  Form,
  Input,
  Layout,
  Row,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';

import { IsAuthContext } from '../../types';
import { DebuggerSettings } from './DebuggerSettings';
import { SelectedPerson } from './SelectedPerson';

export function SettingsPage() {
  return (
    <Layout style={{ height: '100%' }}>
      <Layout.Content style={{ height: '100%', padding: '16px' }}>
        <IsAuthContext.Consumer>
          {({ key, base, updateBase, updateKey }) => (
            <Tabs
              tabPosition="left"
              style={{ marginTop: '16px', minHeight: '50%' }}
            >
              <Tabs.TabPane key="connection" tab="Connection">
                <Row gutter={8}>
                  <Col span={12}>
                    <Card
                      title={
                        <Typography.Text strong>
                          Connection Settings
                        </Typography.Text>
                      }
                      type="inner"
                    >
                      <Form.Item label="Server Admin Key">
                        <Input.Password
                          defaultValue={key}
                          onBlur={({ target }) => updateKey(target.value)}
                        />
                      </Form.Item>
                      <Form.Item
                        label={
                          <Tooltip
                            title={
                              <Typography>
                                Leaving this blank is correct for most setups.
                                Changing this value will force the UI to send
                                requests to a different api target than what
                                provided the UI.
                              </Typography>
                            }
                          >
                            Server Base URL
                          </Tooltip>
                        }
                      >
                        <Input
                          placeholder="Leave blank for same domain / default operation"
                          defaultValue={base}
                          onBlur={({ target }) => updateBase(target.value)}
                        />
                      </Form.Item>
                    </Card>
                  </Col>
                  {is.empty(key) ? undefined : (
                    <Col span={12}>
                      <SelectedPerson />
                    </Col>
                  )}
                </Row>
              </Tabs.TabPane>
              <Tabs.TabPane
                key="debugger"
                tab="Debugger"
                disabled={is.empty(key)}
              >
                <DebuggerSettings />
              </Tabs.TabPane>
            </Tabs>
          )}
        </IsAuthContext.Consumer>
      </Layout.Content>
    </Layout>
  );
}
