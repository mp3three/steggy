import PlusBoxMultiple from '@2fd/ant-design-icons/lib/PlusBoxMultiple';
import { RoomDTO, RoomMetadataDTO } from '@automagical/controller-shared';
import { ARRAY_OFFSET, is } from '@automagical/utilities';
import { Button, Card, List, Popconfirm, Space, Typography } from 'antd';
import React from 'react';

import { sendRequest } from '../../types';
import { MetadataEdit } from './MetadataEdit';

type tState = {
  metadata?: RoomMetadataDTO;
};

export class RoomMetadata extends React.Component<
  { onUpdate: (room: RoomDTO) => void; room: RoomDTO },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
            <List
              dataSource={this.props.room.metadata}
              renderItem={record => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Button
                        type={
                          this.state.metadata?.id === record.id
                            ? 'primary'
                            : 'text'
                        }
                        onClick={() => this.setState({ metadata: record })}
                      >
                        {is.empty(record.name) ? (
                          <Typography.Text type="danger">
                            NO NAME
                          </Typography.Text>
                        ) : (
                          record.name
                        )}
                      </Button>
                    }
                    description={record.type}
                  />
                  <Popconfirm
                    title={`Are you sure you want to remove ${record.name}?`}
                    onConfirm={() => this.remove(record.id)}
                  >
                    <Button danger type="text">
                      X
                    </Button>
                  </Popconfirm>
                </List.Item>
              )}
            />
          </Card>
        </Space>
        <MetadataEdit
          room={this.props.room}
          metadata={this.state.metadata}
          onUpdate={metadata => this.updateMetadata(metadata)}
          onComplete={() => this.setState({ metadata: undefined })}
        />
      </>
    );
  }

  private async create(): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      body: { name: Date.now().toString() } as Partial<RoomMetadataDTO>,
      method: 'post',
      url: `/room/${this.props.room._id}/metadata`,
    });
    this.props.onUpdate(room);
    const metadata = room.metadata[room.metadata.length - ARRAY_OFFSET];
    this.setState({ metadata });
  }

  private async remove(id: string) {
    this.props.onUpdate(
      await sendRequest({
        method: 'delete',
        url: `/room/${this.props.room._id}/metadata/${id}`,
      }),
    );
  }

  private async updateMetadata(
    metadata: Partial<RoomMetadataDTO>,
  ): Promise<void> {
    const room = await sendRequest<RoomDTO>({
      body: metadata,
      method: 'put',
      url: `/room/${this.props.room._id}/metadata/${this.state.metadata.id}`,
    });
    this.props.onUpdate(room);
    const updated = room.metadata.find(
      ({ id }) => id === this.state.metadata?.id,
    );
    this.setState({ metadata: updated });
  }
}
