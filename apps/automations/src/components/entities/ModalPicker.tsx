import { GroupDTO } from '@text-based/controller-shared';
import { HASS_DOMAINS, HassStateDTO } from '@text-based/home-assistant-shared';
import {
  Button,
  Col,
  Divider,
  FormInstance,
  Input,
  List,
  Modal,
  Row,
  Spin,
  Typography,
} from 'antd';
import React from 'react';

import { domain, sendRequest } from '../../types';

export class EntityModalPicker extends React.Component<
  {
    domain?: HASS_DOMAINS;
    exclude?: string[];
    onAdd: (group: GroupDTO) => void;
  },
  {
    available: { entity_id: string }[];
    modalVisible: boolean;
    selected: { entity_id: string }[];
  }
> {
  private form: FormInstance;

  override render() {
    return (
      <>
        <Button onClick={this.show.bind(this)}>Add entities</Button>
        <Modal
          title="Basic Modal"
          visible={this.state?.modalVisible}
          onOk={this.onComplete.bind(this)}
          onCancel={this.hide.bind(this)}
        >
          {!this.state?.available ? (
            <Spin tip="Loading" />
          ) : (
            <>
              <Input placeholder="Filter list" />
              <List
                rowKey="entity_id"
                dataSource={this.getList()}
                pagination={{ pageSize: 10 }}
                renderItem={item => (
                  <List.Item>
                    <Typography.Text>{item.entity_id}</Typography.Text>
                  </List.Item>
                )}
              ></List>
            </>
          )}
        </Modal>
      </>
    );
  }

  private getList() {
    return this.state.available;
  }

  private hide(): void {
    this.setState({ modalVisible: false });
  }

  private onComplete(): void {
    console.log('done');
  }

  private async show(): Promise<void> {
    this.setState({ modalVisible: true });
    let available = await sendRequest<string[]>(`/entity/list`);
    if (this.props.domain) {
      available = available.filter(
        entity_id => domain(entity_id) === this.props.domain,
      );
    }
    this.setState({ available: available.map(entity_id => ({ entity_id })) });
  }
}
