import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { LightStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  notification,
  Popconfirm,
  Radio,
  Spin,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';

export function EntityCard(props: {
  onRemove?: (entity_id: string) => void;
  onUpdate: (state: GeneralSaveStateDTO) => void;
  state: GeneralSaveStateDTO;
  title?: string;
}) {
  const [friendlyName, setName] = useState('');
  const [state, setState] = useState(props?.state?.state);
  useEffect(() => {
    async function refresh(): Promise<void> {
      if (!is.empty(props.title)) {
        setName(props.title);
        return;
      }
      const entity = await sendRequest<LightStateDTO>({
        url: `/entity/id/${props?.state?.ref}`,
      });
      if (is.undefined(entity.attributes)) {
        notification.open({
          description: (
            <Typography>
              {`Server returned bad response. Verify that `}
              <Typography.Text code>{props?.state?.ref}</Typography.Text> still
              exists?
            </Typography>
          ),
          message: 'Entity not found',
          type: 'error',
        });
        return;
      }
      setName(entity.attributes.friendly_name);
    }
    refresh();
  }, [props.state.ref, props.title]);

  function onModeChange(state: string): void {
    setState(state);
    props.onUpdate({ ref: props?.state?.ref, state });
  }
  if (!state) {
    return (
      <Card title={props?.state?.ref} type="inner">
        <Spin />
      </Card>
    );
  }
  return (
    <Card
      title={friendlyName}
      type="inner"
      extra={
        is.undefined(props.onRemove) ? undefined : (
          <Popconfirm
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
            title="Are you sure you want to remove this?"
            onConfirm={() => props.onRemove(props?.state?.ref)}
          >
            <Button size="small" type="text" danger>
              <CloseOutlined />
            </Button>
          </Popconfirm>
        )
      }
    >
      <Radio.Group
        value={state}
        onChange={({ target }) => onModeChange(target.value)}
        buttonStyle="solid"
      >
        <Radio.Button value="off">Off</Radio.Button>
        <Radio.Button value="on">On</Radio.Button>
        <Radio.Button value="toggle">Toggle</Radio.Button>
      </Radio.Group>
    </Card>
  );
}
