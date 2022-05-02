import { Col, Layout, Row, Tabs } from 'antd';
import React from 'react';

import { FD_ICONS } from '../../types';
import { PinnedItems } from './PinnedItems';
import { PinnedMetadata } from './PinnedMetadata';
import { RecentActivations } from './RecentActivations';

export function HomePage() {
  return (
    <Layout>
      <Layout.Content style={{ padding: '16px' }}>
        <Tabs>
          <Tabs.TabPane tab={<>{FD_ICONS.get('pin')} Pinned</>} key="b">
            <Row gutter={8}>
              <Col span={10} offset={2}>
                <PinnedItems />
              </Col>
              <Col span={10}>
                <PinnedMetadata />
              </Col>
            </Row>
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={<>{FD_ICONS.get('execute')} Recent Activations</>}
            key="activations"
          >
            <Row>
              <Col span={20} offset={2}>
                <RecentActivations />
              </Col>
            </Row>
          </Tabs.TabPane>
        </Tabs>
      </Layout.Content>
    </Layout>
  );
}
