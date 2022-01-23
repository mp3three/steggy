import { GroupDTO } from '@text-based/controller-shared';
import { LightStateDTO } from '@text-based/home-assistant-shared';
import { is, sleep } from '@text-based/utilities';
import { Col, Empty, Row } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { LightGroupCard } from '../entities';

type tStateType = { group: GroupDTO };

export class LightGroup extends React.Component<
  { group: GroupDTO; groupUpdate: (group: GroupDTO) => void },
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
              <LightGroupCard
                state={entity.state}
                attributes={entity.extra}
                entity_id={entity.ref}
                onStateChange={this.onStateChange.bind(this)}
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

  private async onStateChange(entity_id: string, value: string): Promise<void> {
    const { group } = this.props as { group: GroupDTO };
    await sendRequest<LightStateDTO>(`/entity/command/${entity_id}/${value}`, {
      method: 'put',
    });
    // Magic race condition solving sleep
    await sleep(100);
    this.props.groupUpdate(group);
  }
}
