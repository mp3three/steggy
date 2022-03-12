import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { RoomDTO, RoomMetadataDTO } from '@automagical/controller-shared';
import { Button, Card, Checkbox, Col, Input, Row, Select, Table } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';

type tState = {
  name: string;
};

export class RoomMetadata extends React.Component<
  { onUpdate: (room: RoomDTO) => void; room: RoomDTO },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <Row gutter={16}>
        <Col span={12}>
          <Card
            type="inner"
            title="Flags"
            extra={
              <Button
                icon={<PlusBoxMultiple />}
                size="small"
                onClick={this.create.bind(this)}
              >
                Create new
              </Button>
            }
          >
            <Table dataSource={this.props.room.metadata}>
              <Table.Column
                title="Name"
                key="name"
                dataIndex="name"
                render={(name: string, record: RoomMetadataDTO) => (
                  <Input
                    value={name}
                    onChange={({ target }) =>
                      this.updateMetadata({ name: target.value }, record.id)
                    }
                  />
                )}
              />
              <Table.Column
                title="Type"
                key="type"
                dataIndex="type"
                render={(type: string, record: RoomMetadataDTO) => (
                  <Select
                    value={type}
                    onChange={(type: 'boolean' | 'string') =>
                      this.updateMetadata({ type }, record.id)
                    }
                  >
                    <Select.Option value="boolean">Boolean</Select.Option>
                    <Select.Option value="string">String</Select.Option>
                  </Select>
                )}
              />
              <Table.Column
                title="Value"
                key="value"
                dataIndex="value"
                render={(value, record: RoomMetadataDTO) =>
                  this.renderValue(value, record.type, record.id)
                }
              />
              <Table.Column
                key="id"
                dataIndex="id"
                render={(id: string) => (
                  <Button danger type="text" onClick={() => this.remove(id)}>
                    X
                  </Button>
                )}
              />
            </Table>
          </Card>
        </Col>
      </Row>
    );
  }

  private async create(): Promise<void> {
    this.props.onUpdate(
      await sendRequest<RoomDTO>({
        method: 'post',
        url: `/room/${this.props.room._id}/metadata`,
      }),
    );
  }

  private async remove(id: string) {
    this.props.onUpdate(
      await sendRequest({
        method: 'delete',
        url: `/room/${this.props.room._id}/metadata/${id}`,
      }),
    );
  }

  private renderValue(
    value: string | boolean,
    type: 'string' | 'boolean',
    id: string,
  ) {
    if (type === 'boolean') {
      return (
        <Checkbox
          checked={Boolean(value)}
          onChange={({ target }) =>
            this.updateMetadata({ value: target.checked }, id)
          }
        />
      );
    }
    return (
      <Input
        value={String(value)}
        onChange={({ target }) =>
          this.updateMetadata({ value: target.value }, id)
        }
      />
    );
  }

  private async updateMetadata(
    metadata: Partial<RoomMetadataDTO>,
    id: string,
  ): Promise<void> {
    this.props.onUpdate(
      await sendRequest({
        body: metadata,
        method: 'put',
        url: `/room/${this.props.room._id}/metadata/${id}`,
      }),
    );
  }
}
