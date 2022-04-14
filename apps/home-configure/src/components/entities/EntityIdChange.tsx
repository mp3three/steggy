import { UpdateEntityIdDTO } from '@steggy/controller-shared';
import { Button, Checkbox, Form, Input, Modal, Space, Typography } from 'antd';
import React from 'react';

import { domain, sendRequest } from '../../types';

type tState = UpdateEntityIdDTO & {
  id: string;
  visible: boolean;
};

export class EntityIdChange extends React.Component<
  { entity: string; onRename: (entity: string) => void },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <>
        <Modal
          onCancel={() => this.setState({ visible: false })}
          onOk={() => this.change()}
          visible={this.state.visible}
          title={
            <Typography>
              {`Change Entity ID: `}
              <Typography.Text code>{this.props.entity}</Typography.Text>
            </Typography>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item label="Entity ID">
              <Input
                prefix={domain(this.props.entity)}
                value={this.state.id}
                onChange={({ target }) => this.setState({ id: target.value })}
              />
            </Form.Item>
            <Checkbox
              onChange={({ target }) =>
                this.setState({ groups: target.checked })
              }
              checked={this.state.groups}
            >
              Update Groups + Save States
            </Checkbox>
            <Checkbox
              onChange={({ target }) =>
                this.setState({ rooms: target.checked })
              }
              checked={this.state.rooms}
            >
              Update Rooms + Save States
            </Checkbox>
            <Checkbox
              onChange={({ target }) =>
                this.setState({ routines: target.checked })
              }
              checked={this.state.routines}
            >
              Update Routines
            </Checkbox>
          </Space>
        </Modal>
        <Button
          onClick={() =>
            this.setState({
              id: this.props.entity.split('.')[1],
              visible: true,
            })
          }
        >
          Change Entity ID
        </Button>
      </>
    );
  }

  private async change(): Promise<void> {
    const id = `${domain(this.props.entity)}.${this.state.id}`;
    await sendRequest({
      body: {
        groups: this.state.groups,
        id,
        rooms: this.state.rooms,
        routines: this.state.routines,
      } as UpdateEntityIdDTO,
      method: 'put',
      url: `/entity/update-id/${this.props.entity}`,
    });
    this.props.onRename(id);
  }
}
