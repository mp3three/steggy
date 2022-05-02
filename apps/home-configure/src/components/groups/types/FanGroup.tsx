import { GeneralSaveStateDTO, GroupDTO } from '@steggy/controller-shared';
import { FanStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import { Col, Empty, Row } from 'antd';

import { sendRequest } from '../../../types';
import { FanEntityCard } from '../../entities';

export function FanGroup(props: {
  group: GroupDTO;
  groupUpdate?: (group: GroupDTO) => void;
}) {
  const lightCards: Record<string, FanEntityCard> = {};

  async function onAttributeChange(state: GeneralSaveStateDTO): Promise<void> {
    const fan = await sendRequest<FanStateDTO>({
      body: state,
      method: 'put',
      url: `/entity/light-state/${state.ref}`,
    });
    const card = lightCards[state.ref];
    card.load(fan);
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
            <FanEntityCard
              state={entity}
              selfContained
              ref={reference => (lightCards[entity.ref] = reference)}
              onUpdate={state => onAttributeChange(state)}
              onRemove={id => onRemove(id)}
            />
          </Col>
        ))
      )}
    </Row>
  );
}
