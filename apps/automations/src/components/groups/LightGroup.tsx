import { GroupDTO } from '@text-based/controller-shared';
import { Card, Col, Divider, Row } from 'antd';
import React from 'react';

import { LightGroupCard } from '../entities';

type tStateType = { group: GroupDTO };

export class LightGroup extends React.Component<
  { group: GroupDTO },
  tStateType
> {
  override render() {
    return (
      <>
        <Card title="Group Entities">
          <Row gutter={[16, 16]}>
            {this.props.group.entities.map(entity => (
              <Col>
                <LightGroupCard entity_id={entity} />
              </Col>
            ))}
          </Row>
        </Card>
        <Divider />
      </>
    );
  }
}
