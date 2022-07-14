import { is, TitleCase } from '@steggy/utilities';
import { Button, Form, Input, Modal, Tooltip, Typography } from 'antd';
import { useState } from 'react';

import { FD_ICONS } from '../../types';

export function ImportCreate(props: {
  onCreate: (create: {
    friendlyName: string;
    import: string;
  }) => void | Promise<void>;
  primary: boolean;
  type: string;
}) {
  const [friendlyName, setFriendlyName] = useState<string>();
  const [importText, setImportText] = useState<string>();
  const [visible, setVisible] = useState(false);

  function close() {
    setVisible(false);
    setImportText('');
    setFriendlyName('');
  }

  return (
    <>
      <Modal
        visible={visible}
        maskClosable
        forceRender
        okText="Create"
        okButtonProps={{
          disabled: is.empty(friendlyName) && is.empty(importText),
        }}
        width="50vw"
        onOk={async () => {
          await props.onCreate({
            friendlyName,
            import: importText,
          });
          close();
        }}
        onCancel={() => close()}
        centered
        title={`Create new ${TitleCase(props.type)}`}
      >
        {visible ? (
          <>
            <Form.Item label="Friendly Name" name="friendlyName">
              <Input
                value={friendlyName}
                onChange={({ target }) => setFriendlyName(target.value)}
              />
            </Form.Item>
            <Form.Item
              label={
                <Tooltip
                  title={
                    <Typography>
                      <Typography.Paragraph>
                        Paste in a previously exported routine to load it's
                        data.
                      </Typography.Paragraph>
                      <Typography.Text type="secondary">
                        Note: identifiers will not be preserved
                      </Typography.Text>
                    </Typography>
                  }
                >
                  Import
                </Tooltip>
              }
              name="import"
            >
              <Input.TextArea
                value={importText}
                style={{ minHeight: '10vh' }}
                onChange={({ target }) => setImportText(target.value)}
              />
            </Form.Item>
          </>
        ) : undefined}
      </Modal>
      <Button
        size="small"
        type={props.primary ? 'primary' : 'text'}
        icon={FD_ICONS.get('plus_box')}
        onClick={() => setVisible(true)}
      >
        Create new
      </Button>
    </>
  );
}
