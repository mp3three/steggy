import { RoutineCommandDTO, RoutineDTO } from '@steggy/controller-shared';
import { Button, Drawer, Empty, List } from 'antd';
import { useState } from 'react';

import { FD_ICONS, ROUTINE_COMMAND_LIST, sendRequest } from '../../../types';

export function CommandAdd(props: {
  highlight: boolean;
  onCreate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  const [visible, setVisible] = useState(false);

  async function addCommand(type: string, name: string): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      body: {
        friendlyName: `New ${name}`,
        type: type,
      } as Partial<RoutineCommandDTO>,
      method: 'post',
      url: `/routine/${props.routine._id}/command`,
    });
    props.onCreate(routine);
    setVisible(false);
  }

  if (!props.routine) {
    return <Empty />;
  }
  return (
    <>
      <Drawer
        title="Add Command"
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <List
          pagination={{ size: 'small' }}
          dataSource={ROUTINE_COMMAND_LIST}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={item.description}
              />
              <Button
                icon={FD_ICONS.get('list_add')}
                type="primary"
                shape="round"
                onClick={() => addCommand(item.type, item.name)}
              />
            </List.Item>
          )}
        />
      </Drawer>
      <Button
        size="small"
        type={props.highlight ? 'primary' : 'text'}
        icon={FD_ICONS.get('plus_box')}
        onClick={() => setVisible(true)}
      >
        Add new
      </Button>
    </>
  );
}
