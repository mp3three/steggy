import { GroupDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Col, Empty, Row } from 'antd';
import React from 'react';

import { LightEntityCard } from '../../entities';

type tStateType = { group: GroupDTO };

export class LightGroup extends React.Component<
  { group: GroupDTO; groupUpdate?: (group: GroupDTO) => void },
  tStateType
> {
  override render() {
    return (
      <Row gutter={[16, 16]}>
        {is.empty(this.props?.group?.state?.states) ? (
          <Col span={8} offset={8}>
            <Empty description="No entities in group" />
          </Col>
        ) : (
          this.props.group.state.states.map(entity => (
            <Col key={entity.ref}>
              <LightEntityCard
                state={entity}
                selfContained
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
