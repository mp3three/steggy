import {
  GroupDTO,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-shared';
import { FanStateDTO } from '@automagical/home-assistant-shared';
import { is } from '@automagical/utilities';
import { Col, Empty, Row } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { FanEntityCard } from '../entities';

type tStateType = { group: GroupDTO };

export class FanGroup extends React.Component<
  {
    group: GroupDTO;
    groupUpdate?: (group: GroupDTO) => void;
  },
  tStateType
> {
  private lightCards: Record<string, FanEntityCard> = {};

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
              <FanEntityCard
                state={entity}
                selfContained
                ref={reference => (this.lightCards[entity.ref] = reference)}
                onUpdate={this.onAttributeChange.bind(this)}
                onRemove={this.onRemove.bind(this)}
              />
            </Col>
          ))
        )}
      </Row>
    );
  }

  private async onAttributeChange(
    state: RoomEntitySaveStateDTO,
  ): Promise<void> {
    const fan = await sendRequest<FanStateDTO>(
      `/entity/light-state/${state.ref}`,
      {
        body: JSON.stringify(state),
        method: 'put',
      },
    );
    const card = this.lightCards[state.ref];
    card.load(fan);
  }

  private onRemove(entity_id: string): void {
    const { group } = this.props as { group: GroupDTO };
    group.entities = group.entities.filter(id => id !== entity_id);
    this.props.groupUpdate(group);
  }
}
