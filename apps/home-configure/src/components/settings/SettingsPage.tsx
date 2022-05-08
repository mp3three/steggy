import { is } from '@steggy/utilities';
import { Layout, Tabs } from 'antd';

import { IsAuthContext } from '../../types';
import { ConnectionSettings } from './ConnectionSettings';
import { DebuggerSettings } from './DebuggerSettings';

export function SettingsPage() {
  return (
    <Layout style={{ height: '100%' }}>
      <Layout.Content style={{ height: '100%', padding: '16px' }}>
        <IsAuthContext.Consumer>
          {({ key }) => (
            <Tabs
              tabPosition="left"
              style={{ marginTop: '16px', minHeight: '50%' }}
            >
              <Tabs.TabPane key="connection" tab="Connection">
                <ConnectionSettings />
              </Tabs.TabPane>
              {is.empty(key) ? undefined : (
                <Tabs.TabPane key="debugger" tab="Debugger">
                  <DebuggerSettings />
                </Tabs.TabPane>
              )}
            </Tabs>
          )}
        </IsAuthContext.Consumer>
      </Layout.Content>
    </Layout>
  );
}
