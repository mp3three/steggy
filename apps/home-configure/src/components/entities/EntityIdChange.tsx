import { UpdateEntityIdDTO } from '@steggy/controller-shared';
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Modal,
  notification,
  Space,
  Typography,
} from 'antd';
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

  private get defaultId() {
    return this.props.entity.split('.')[1];
  }

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
                prefix={
                  <Typography.Text code>
                    {domain(this.props.entity)}
                  </Typography.Text>
                }
                value={this.state.id}
                onChange={({ target }) => this.setState({ id: target.value })}
              />
            </Form.Item>
            <Divider orientation="left">Update References</Divider>
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
          type="text"
          onClick={() =>
            this.setState({
              id: this.defaultId,
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
    if (this.state.id === this.defaultId) {
      notification.error({
        message: `entity_id not changed`,
      });
      return;
    }
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
    this.setState({ visible: false });
    notification.success({
      message: (
        <Typography>
          <Typography.Text code>{this.props.entity}</Typography.Text>
          {` renamed to `}
          <Typography.Text code>{id}</Typography.Text>
        </Typography>
      ),
    });
  }
}
