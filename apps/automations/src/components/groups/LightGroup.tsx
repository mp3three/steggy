import {
  GroupDTO,
  RoomEntitySaveStateDTO,
} from '@text-based/controller-shared';
import { LightStateDTO } from '@text-based/home-assistant-shared';
import { is } from '@text-based/utilities';
import { Col, Empty, Row } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { LightGroupCard } from '../entities';

type tStateType = { group: GroupDTO };

export class LightGroup extends React.Component<
  { group: GroupDTO; groupUpdate?: (group: GroupDTO) => void },
  tStateType
> {
  private lightCards: Record<string, LightGroupCard> = {};

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
                state={entity}
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

  private entityState(id: string): RoomEntitySaveStateDTO {
    return this.props.group.state.states.find(i => i.ref === id);
  }

  private async onAttributeChange(
    state: RoomEntitySaveStateDTO,
  ): Promise<void> {
    const { group } = this.props as { group: GroupDTO };
    const light = await sendRequest<LightStateDTO>(
      `/entity/light-state/${state.ref}`,
      {
        body: JSON.stringify(state),
        method: 'put',
      },
    );
    const card = this.lightCards[state.ref];
    card.setState({
      state: light.state,
      ...light.attributes,
    });
    if (
      light.attributes.rgb_color &&
      light.attributes.color_mode !== 'color_temp'
    ) {
      const rgb = light.attributes.rgb_color;
      card.setState({
        color: rgb.map(i => i.toString(16)).join(''),
      });
    }
    // this.props.groupUpdate(group);
  }

  private onRemove(entity_id: string): void {
    const { group } = this.props as { group: GroupDTO };
    group.entities = group.entities.filter(id => id !== entity_id);
    this.props.groupUpdate(group);
  }

  private async onStateChange(entity_id: string, value: string): Promise<void> {
    await sendRequest<LightStateDTO>(`/entity/command/${entity_id}/${value}`, {
      method: 'put',
    });
  }
}
