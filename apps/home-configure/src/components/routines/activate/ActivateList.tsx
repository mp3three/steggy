import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  ROUTINE_ACTIVATE_TYPES,
  RoutineActivateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { ARRAY_OFFSET, TitleCase } from '@steggy/utilities';
import { Button, Card, List, Popconfirm } from 'antd';
import { useState } from 'react';

import { sendRequest } from '../../../types';
import { RoutineActivateDrawer } from '../RoutineActivateDrawer';
import { ActivateAdd } from './ActivateAdd';

export function ActivateList(props: {
  highlight: boolean;
  onUpdate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  const [activate, setActivate] = useState<RoutineActivateDTO>();

  async function deleteActivate(item: RoutineActivateDTO): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      method: 'delete',
      url: `/routine/${props.routine._id}/activate/${item.id}`,
    });
    props.onUpdate(routine);
  }

  function onAdd(routine: RoutineDTO): void {
    const activate = routine.activate[routine.activate.length - ARRAY_OFFSET];
    setActivate(activate);
    props.onUpdate(routine);
  }

  async function updateActivate(
    body: Partial<ROUTINE_ACTIVATE_TYPES>,
  ): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      body,
      method: 'put',
      url: `/routine/${props.routine._id}/activate/${activate.id}`,
    });
    body = routine.activate.find(({ id }) => id === activate.id);
    setActivate(body as RoutineActivateDTO);
    props.onUpdate(routine);
  }

  return (
    <>
      <Card
        type="inner"
        extra={
          <ActivateAdd
            highlight={props.highlight}
            routine={props.routine}
            onCreate={routine => onAdd(routine)}
          />
        }
      >
        <List
          pagination={false}
          dataSource={props.routine.activate}
          renderItem={item => (
            <List.Item key={item.id} onClick={() => setActivate(item)}>
              <List.Item.Meta
                title={
                  <Button
                    size="small"
                    onClick={() => setActivate(item)}
                    type={activate?.id === item.id ? 'primary' : 'text'}
                  >
                    {item.friendlyName}
                  </Button>
                }
                description={TitleCase(
                  item.type === 'kunami' ? 'sequence' : item.type,
                )}
              />
              <Popconfirm
                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                title={`Are you sure you want to delete ${item.friendlyName}?`}
                onConfirm={e => {
                  deleteActivate(item);
                  e?.stopPropagation();
                }}
              >
                <Button danger type="text" onClick={e => e.stopPropagation()}>
                  <CloseOutlined />
                </Button>
              </Popconfirm>
            </List.Item>
          )}
        />
      </Card>
      <RoutineActivateDrawer
        routine={props.routine}
        onUpdate={activate => updateActivate(activate)}
        onComplete={() => setActivate(undefined)}
        activate={activate}
      />
    </>
  );
}
