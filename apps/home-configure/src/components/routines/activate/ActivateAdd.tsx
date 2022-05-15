import {
  ActivationEventSettings,
  RoutineActivateDTO,
  RoutineDTO,
} from '@steggy/controller-shared';
import { Button, Drawer, Empty, List, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../../types';

export function ActivateAdd(props: {
  highlight: boolean;
  onCreate: (routine: RoutineDTO) => void;
  routine: RoutineDTO;
}) {
  const [visible, setVisible] = useState(false);
  const [activateList, setActivateList] = useState<ActivationEventSettings[]>(
    [],
  );

  useEffect(() => {
    async function refresh() {
      setActivateList(
        await sendRequest<ActivationEventSettings[]>({
          url: `/debug/activation-event`,
        }),
      );
    }
    refresh();
  }, []);

  async function addCommand(type: string, name: string): Promise<void> {
    const routine = await sendRequest<RoutineDTO>({
      body: {
        friendlyName: `New ${name}`,
        type: type,
      } as Partial<RoutineActivateDTO>,
      method: 'post',
      url: `/routine/${props.routine._id}/activate`,
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
        title={<Typography.Text strong>Add Activation Event</Typography.Text>}
        visible={visible}
        onClose={() => setVisible(false)}
      >
        <List
          dataSource={activateList}
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
