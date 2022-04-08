import { HassStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import { Button, Drawer } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { EntityInspect } from './EntityInspect';

type tState = {
  entity: HassStateDTO;
  flags: string[];
};

export class EntityInspectButton extends React.Component<
  { entity_id: string },
  tState
> {
  override state = { flags: [] } as tState;

  override render() {
    return (
      <>
        <Drawer
          visible={!is.undefined(this.state.entity)}
          onClose={() => this.setState({ entity: undefined, flags: [] })}
          title={
            this.state?.entity?.attributes?.friendly_name ??
            this.props.entity_id
          }
          size="large"
        >
          <EntityInspect
            entity={this.state.entity}
            flags={this.state.flags}
            onFlagsUpdate={flags => this.setState({ flags })}
          />
        </Drawer>
        <Button type="text" onClick={() => this.load()}>
          {this.props.entity_id}
        </Button>
      </>
    );
  }

  private async load(): Promise<void> {
    await Promise.all(
      [
        async () => {
          const entity = await sendRequest<HassStateDTO>({
            url: `/entity/id/${this.props.entity_id}`,
          });
          this.setState({ entity });
        },
        async () => {
          const flags = await sendRequest<string[]>({
            url: `/entity/flags/${this.props.entity_id}`,
          });
          this.setState({ flags });
        },
      ].map(async f => await f()),
    );
  }
}
