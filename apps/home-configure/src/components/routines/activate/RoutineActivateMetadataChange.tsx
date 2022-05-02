import { MetadataChangeDTO } from '@steggy/controller-shared';
import { Checkbox, Divider, Form, Space, Tooltip, Typography } from 'antd';

import { RoomMetadataComparison } from '../../misc';

export function RoutineActivateMetadataChange(props: {
  activate: MetadataChangeDTO;
  onUpdate: (activate: Partial<MetadataChangeDTO>) => void;
}) {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <RoomMetadataComparison
        unwrap
        comparison={props.activate}
        onUpdate={update => props.onUpdate(update)}
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
                  Some entities will repeatedly report the same state value (ex:
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
          checked={props.activate?.latch}
          onChange={({ target }) => props.onUpdate({ latch: target.checked })}
        />
      </Form.Item>
    </Space>
  );
}
