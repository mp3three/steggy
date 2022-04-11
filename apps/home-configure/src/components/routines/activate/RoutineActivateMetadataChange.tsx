import { MetadataChangeDTO } from '@steggy/controller-shared';
import { Checkbox, Divider, Form, Space, Tooltip, Typography } from 'antd';
import React from 'react';

import { RoomMetadataComparison } from '../../misc';

export class RoutineActivateMetadataChange extends React.Component<{
  activate: MetadataChangeDTO;
  onUpdate: (activate: Partial<MetadataChangeDTO>) => void;
}> {
  override render() {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <RoomMetadataComparison
          unwrap
          comparison={this.props.activate}
          onUpdate={update => this.props.onUpdate(update)}
        />
        <Divider orientation="left">Modifiers</Divider>
        <Form.Item
          label={
            <Tooltip
              title={
                <Typography>
                  <Typography.Paragraph>
                    When not checked, every state change reported by Home
                    Assistant is eligable to trigger routines.
                  </Typography.Paragraph>
                  <Divider />
                  <Typography.Paragraph>
                    Some entities will repeatedly report the same state value
                    (ex:
                    <Typography.Text code>on, on, on, off, on</Typography.Text>
                    ). Latching allows for filtering out of the repeat values.
                  </Typography.Paragraph>
                </Typography>
              }
            >
              Latch
            </Tooltip>
          }
        >
          <Checkbox
            checked={this.props.activate?.latch}
            onChange={({ target }) =>
              this.props.onUpdate({ latch: target.checked })
            }
          />
        </Form.Item>
      </Space>
    );
  }
}
