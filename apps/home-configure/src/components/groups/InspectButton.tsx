import { GroupDTO } from '@steggy/controller-shared';
import { Button, Drawer } from 'antd';
import React, { useState } from 'react';

import { sendRequest } from '../../types';
import { GroupExtraActions } from './GroupExtraActions';
import { GroupListDetail } from './GroupListDetail';

export function GroupInspectButton(props: {
  group: GroupDTO;
  onUpdate?: (group: GroupDTO) => void;
}) {
  const [visible, setVisible] = useState(false);

  async function load(): Promise<void> {
    const group = await sendRequest<GroupDTO>({
      url: `/group/${props.group._id}`,
    });
    props.onUpdate(group);
    setVisible(true);
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
            group={props.group}
            onUpdate={group => props.onUpdate(group)}
          />
        }
      >
        <GroupListDetail
          type="inner"
          group={props.group}
          onUpdate={group => props.onUpdate(group)}
        />
      </Drawer>
      <Button type="text" size="small" onClick={() => load()}>
        {props.group.friendlyName}
      </Button>
    </>
  );
}
