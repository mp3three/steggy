import { GroupDTO } from '@steggy/controller-shared';
import { Button, Drawer } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { GroupListDetail } from './GroupListDetail';

type tState = {
  visible?: boolean;
};

export class GroupInspectButton extends React.Component<
  { group: GroupDTO; onUpdate?: (group: GroupDTO) => void },
  tState
> {
  override state = { flags: [] } as tState;

  override render() {
    return (
      <>
        <Drawer
          visible={this.state.visible}
          onClose={() => this.setState({ visible: false })}
          title="Group Settings"
          size="large"
        >
          <GroupListDetail
            type="inner"
            group={this.props.group}
            onUpdate={group => this.props.onUpdate(group)}
          />
        </Drawer>
        <Button type="text" onClick={() => this.load()}>
          {this.props.group.friendlyName}
        </Button>
      </>
    );
  }

  private async load(): Promise<void> {
    const group = await sendRequest<GroupDTO>({
      url: `/group/${this.props.group._id}`,
    });
    this.props.onUpdate(group);
    this.setState({ visible: true });
  }
}
