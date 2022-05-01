import { GeneralSaveStateDTO, GroupDTO } from '@steggy/controller-shared';
import { SwitchStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import { Col, Empty, Row } from 'antd';
import React from 'react';

import { sendRequest } from '../../../types';
import { SwitchEntityCard } from '../../entities';

type tStateType = { group: GroupDTO };

export class SwitchGroup extends React.Component<
  { group: GroupDTO; groupUpdate?: (group: GroupDTO) => void },
  tStateType
> {
  private lightCards: Record<string, SwitchEntityCard> = {};

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
              <SwitchEntityCard
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

  private async onAttributeChange(state: GeneralSaveStateDTO): Promise<void> {
    const entity = await sendRequest<SwitchStateDTO>({
      method: 'put',
      url: `/entity/command/${state.ref}/${state.state}`,
    });
    const card = this.lightCards[state.ref];
    card.setState({
      state: entity.state,
    });
  }

  private onRemove(entity_id: string): void {
    const { group } = this.props as { group: GroupDTO };
    group.entities = group.entities.filter(id => id !== entity_id);
    this.props.groupUpdate(group);
  }
}
