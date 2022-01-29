import Magnify from '@2fd/ant-design-icons/lib/Magnify';
import { RoomEntitySaveStateDTO } from '@text-based/controller-shared';
import { HassStateDTO } from '@text-based/home-assistant-shared';
import { Button, Card, Col, Drawer, Empty, Row, Space, Table } from 'antd';
import React from 'react';

import { domain } from '../../types';
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
            <Col span={8}>
              <Card title="Control Entity">{this.entityControl()}</Card>
            </Col>
            <Col span={8}>
              <Card title="Attributes">
                <Table dataSource={data}>
                  <Table.Column key="key" title="key" dataIndex="key" />
                  <Table.Column key="value" title="value" dataIndex="value" />
                </Table>
              </Card>
            </Col>
          </Row>
        </Drawer>
      </>
    );
  }

  private entityControl() {
    const { entity_id, state, attributes } = this.entity;
    switch (domain(entity_id)) {
      case 'light':
        return (
          <LightEntityCard
            state={{
              extra: attributes,
              ref: entity_id,
              state: state as string,
            }}
            selfContained
          />
        );
      case 'switch':
        return (
          <SwitchEntityCard
            state={{
              extra: attributes,
              ref: entity_id,
              state: state as string,
            }}
            selfContained
          />
        );
    }
    return <Empty description="No control widget" />;
  }
}
