import { GroupDTO } from '@text-based/controller-shared';
import { is } from '@text-based/utilities';
import { Col, Empty, Row } from 'antd';
import React from 'react';

import { LightGroupCard } from '../entities';

type tStateType = { group: GroupDTO };

export class LightGroup extends React.Component<
  { group: GroupDTO; groupUpdate: (group: GroupDTO) => void },
  tStateType
> {
  override render() {
    return (
      <Row gutter={[16, 16]}>
        {is.empty(this.props.group.entities) ? (
          <Col span={8} offset={8}>
            <Empty description="No entities in group" />
          </Col>
        ) : (
          this.props.group.entities.map(entity_id => (
            <Col>
              <LightGroupCard
                entity_id={entity_id}
                onRemove={this.onRemove.bind(this)}
              />
            </Col>
          ))
        )}
      </Row>
    );
  }

  private onRemove(entity_id: string): void {
    const { group } = this.props as { group: GroupDTO };
    group.entities = group.entities.filter(id => id !== entity_id);
    this.props.groupUpdate(group);
  }
}
