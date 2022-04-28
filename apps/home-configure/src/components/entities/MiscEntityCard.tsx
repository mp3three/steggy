import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { HassStateDTO, LightStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  notification,
  Popconfirm,
  Popover,
  Spin,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';
import { EntityAttributePopover } from './AttributePopover';

export function EntityCard(props: {
  onRemove?: (entity_id: string) => void;
  onUpdate: (state: GeneralSaveStateDTO) => void;
  state: HassStateDTO;
  title?: string;
}) {
  const [friendly_name, setFriendlyName] = useState<string>();

  const ref = props?.state?.entity_id;
  const state = props?.state?.state as string;

  useEffect(() => {
    const refresh = async () => {
      if (!is.empty(props.title)) {
        setFriendlyName(props.title);
        return;
      }
      const entity = await sendRequest<LightStateDTO>({
        url: `/entity/id/${ref}`,
      });
      if (is.undefined(entity.attributes)) {
        notification.open({
          description: (
            <Typography>
              {`Server returned bad response. Verify that `}
              <Typography.Text code>{ref}</Typography.Text> still exists?
            </Typography>
          ),
          message: 'Entity not found',
          type: 'error',
        });
        return;
      }
      setFriendlyName(entity.attributes.friendly_name);
    };
    refresh();
  }, [ref, props.title]);

  if (!ref) {
    return (
      <Card title={ref} type="inner">
        <Spin />
      </Card>
    );
  }
  return (
    <Card
      title={friendly_name}
      type="inner"
      extra={
        is.undefined(props.onRemove) ? undefined : (
          <Popconfirm
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            title="Are you sure you want to remove this?"
            onConfirm={() => props.onRemove(ref)}
          >
            <Button size="small" type="text" danger>
              <CloseOutlined />
            </Button>
          </Popconfirm>
        )
      }
    >
      <Popover content={<EntityAttributePopover state={props.state} />}>
        <Typography.Text>
          {is.object(state) ? JSON.stringify(state) : state}
        </Typography.Text>
      </Popover>
    </Card>
  );
}
