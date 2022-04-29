import { GeneralSaveStateDTO, GroupDTO } from '@steggy/controller-shared';
import { SwitchStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import { Col, Empty, Row } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { LockEntityCard } from '../entities';

export function LockGroup(props: {
  group: GroupDTO;
  groupUpdate?: (group: GroupDTO) => void;
}) {
  async function onAttributeChange(state: GeneralSaveStateDTO): Promise<void> {
    const entity = await sendRequest<SwitchStateDTO>({
      method: 'put',
      url: `/entity/command/${state.ref}/${state.state}`,
    });
    const card = this.lightCards[state.ref];
    card.setState({
      state: entity.state,
    });
  }

  function onRemove(entity_id: string): void {
    props.group.entities = props.group.entities.filter(id => id !== entity_id);
    props.groupUpdate(props.group);
  }

  return (
    <Row gutter={[16, 16]}>
      {is.empty(props?.group?.state?.states) ? (
        <Col span={8} offset={8}>
          <Empty description="No entities in group" />
        </Col>
      ) : (
        props.group.state.states.map(entity => (
          <Col key={entity.ref}>
            <LockEntityCard
              state={entity}
              selfContained
              ref={reference => (this.lightCards[entity.ref] = reference)}
              onUpdate={state => onAttributeChange(state)}
              onRemove={id => onRemove(id)}
            />
          </Col>
        ))
      )}
    </Row>
  );
}
