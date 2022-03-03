import Magnify from '@2fd/ant-design-icons/lib/Magnify';
import { RoomEntitySaveStateDTO } from '@automagical/controller-shared';
import { HassStateDTO } from '@automagical/home-assistant-shared';
import { Button, Col, Drawer, Empty, Row } from 'antd';
import { dump } from 'js-yaml';
import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { domain } from '../../types';
import { FanEntityCard } from './FanEntityCard';
import { LightEntityCard } from './LightEntityCard';
import { SwitchEntityCard } from './SwitchEntityCard';

type tStateType = {
  visible?: boolean;
};

export class EntityDetailDrawer extends React.Component<
  {
    entity: HassStateDTO;
    onUpdate?: (state: RoomEntitySaveStateDTO) => void;
  },
  tStateType
> {
  private get entity() {
    return this.props.entity;
  }

  override render() {
    const attributes = this.entity.attributes;
    const data = Object.keys(attributes).map(key => ({
      key,
      value: attributes[key],
    }));
    return (
      <>
        <Button onClick={() => this.setState({ visible: true })} type="text">
          <Magnify /> {this.props.entity.attributes.friendly_name}
        </Button>
        <Drawer
          size="large"
          visible={this.state?.visible}
          placement="bottom"
          onClose={() => this.setState({ visible: false })}
        >
          <Row gutter={8}>
            <Col span={8}>{this.entityControl()}</Col>
            <Col span={8}>
              <SyntaxHighlighter language="yaml" style={atomDark}>
                {dump(this.props.entity).trimEnd()}
              </SyntaxHighlighter>
            </Col>
          </Row>
        </Drawer>
      </>
    );
  }

  private entityControl() {
    const { entity } = this.props;
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
}
