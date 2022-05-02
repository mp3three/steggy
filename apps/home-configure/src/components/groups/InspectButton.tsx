import { GroupDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Button, Drawer } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { GroupExtraActions } from './GroupExtraActions';
import { GroupListDetail } from './GroupListDetail';

export function GroupInspectButton(props: {
  group: GroupDTO | string;
  onUpdate?: (group: GroupDTO) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [group, setGroup] = useState<GroupDTO>();

  async function load(visible?: boolean): Promise<void> {
    const group = await sendRequest<GroupDTO>({
      url: `/group/${is.string(props.group) ? props.group : props.group._id}`,
    });
    if (props.onUpdate) {
      props.onUpdate(group);
    }
    setGroup(group);
    if (visible) {
      setVisible(true);
    }
  }

  useEffect(() => {
    if (is.string(props.group)) {
      load();
      return;
    }
    setGroup(props.group);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.group]);

  function onUpdate(update: GroupDTO) {
    setGroup({
      ...group,
      ...update,
    });
    if (props.onUpdate) {
      props.onUpdate(update);
    }
  }

  return (
    <>
      <Drawer
        visible={visible}
        onClose={() => setVisible(false)}
        title="Group Settings"
        size="large"
        extra={
          <GroupExtraActions
            group={group}
            onUpdate={group => onUpdate(group)}
          />
        }
      >
        <GroupListDetail
          type="inner"
          group={group}
          onUpdate={group => onUpdate(group)}
        />
      </Drawer>
      <Button
        type={visible ? 'primary' : 'text'}
        size="small"
        onClick={() => load(true)}
      >
        {group?.friendlyName}
      </Button>
    </>
  );
}
