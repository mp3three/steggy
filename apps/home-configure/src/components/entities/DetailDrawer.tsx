import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { HassStateDTO } from '@steggy/home-assistant-shared';
import { Button, Col, Drawer, Empty, Row } from 'antd';
import { dump } from 'js-yaml';
import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { domain, FD_ICONS } from '../../types';
import { FanEntityCard, LightEntityCard, SwitchEntityCard } from './domains';

export function EntityDetailDrawer({
  entity,
}: {
  entity: HassStateDTO;
  onUpdate?: (state: GeneralSaveStateDTO) => void;
}) {
  const [visible, setVisible] = useState(false);
  function entityControl() {
    switch (domain(entity.entity_id)) {
      case 'light':
        return (
          <LightEntityCard selfContained state={{ ref: entity.entity_id }} />
        );
      case 'media_player':
      case 'switch':
        return (
          <SwitchEntityCard selfContained state={{ ref: entity.entity_id }} />
        );
      case 'fan':
        return (
          <FanEntityCard selfContained state={{ ref: entity.entity_id }} />
        );
    }
    return <Empty description="No control widget" />;
  }
  return (
    <>
      <Button
        onClick={() => setVisible(true)}
        type={visible ? 'primary' : 'text'}
      >
        {FD_ICONS.get('magnify')} {entity.attributes.friendly_name}
      </Button>
      <Drawer
        size="large"
        visible={visible}
        placement="bottom"
        onClose={() => setVisible(false)}
      >
        <Row gutter={8}>
          <Col span={8}>{entityControl()}</Col>
          <Col span={8}>
            <SyntaxHighlighter language="yaml" style={atomDark}>
              {dump(entity).trimEnd()}
            </SyntaxHighlighter>
          </Col>
        </Row>
      </Drawer>
    </>
  );
}
