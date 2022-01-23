import { GroupDTO } from '@text-based/controller-shared';
import { HASS_DOMAINS, HassStateDTO } from '@text-based/home-assistant-shared';
import { Button, FormInstance, Modal, Spin, Table } from 'antd';
import React from 'react';

import { domain, sendRequest } from '../../types';

export class EntityModalPicker extends React.Component<
  {
    domain?: HASS_DOMAINS;
    group: GroupDTO;
    groupUpdated: (group: GroupDTO) => void;
  },
  { list: { entity_id: string }[]; modalVisible: boolean }
> {
  private form: FormInstance;

  override render() {
    return (
      <>
        <Button onClick={this.show.bind(this)}>Manage entities</Button>
        <Modal
          forceRender
          title="Basic Modal"
          visible={this.state?.modalVisible}
          onOk={this.validate.bind(this)}
          onCancel={this.hide.bind(this)}
        >
          {!this.state?.list ? (
            <Spin tip="Loading" />
          ) : (
            <Table
              dataSource={this.state.list}
              rowSelection={{ type: 'checkbox' }}
            >
              <Table.Column title="Entity ID" dataIndex="entity_id" />
            </Table>
          )}
        </Modal>
      </>
    );
  }

  private hide(): void {
    this.setState({ modalVisible: false });
  }

  private async show(): Promise<void> {
    this.setState({ modalVisible: true });
    let list = await sendRequest<string[]>(`/entity/list`);
    if (this.props.domain) {
      list = list.filter(entity_id => domain(entity_id) === this.props.domain);
    }
    this.setState({ list: list.map(entity_id => ({ entity_id })) });
  }

  private async validate(): Promise<void> {
    try {
      const values = await this.form.validateFields();
      const group = await sendRequest<GroupDTO>(
        `/group/${this.props.group._id}`,
        {
          body: JSON.stringify(values),
          method: 'put',
        },
      );
      this.hide();
      this.props.groupUpdated(group);
    } catch (error) {
      console.error(error);
    }
  }
}
