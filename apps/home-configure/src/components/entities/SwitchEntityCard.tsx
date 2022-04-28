import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { LightStateDTO, SwitchStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import {
  Button,
  Card,
  notification,
  Popconfirm,
  Radio,
  Space,
  Spin,
  Switch,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';

// eslint-disable-next-line radar/cognitive-complexity
export function SwitchEntityCard(props: {
  onRemove?: (entity_id: string) => void;
  onUpdate?: (state: GeneralSaveStateDTO) => void;
  optional?: boolean;
  selfContained?: boolean;
  state?: GeneralSaveStateDTO;
  stateOnly?: boolean;
  title?: string;
}) {
  const [disabled, setDisabled] = useState<boolean>(
    props.optional && is.undefined(props.state?.state),
  );
  const [friendly_name, setFriendlyName] = useState<string>();
  const [state, setState] = useState<string>(props.state.state ?? 'off');
  const ref = props?.state?.ref;

  useEffect(() => {
    async function refresh(): Promise<void> {
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
      if (props.selfContained) {
        setState(entity.state);
      }
    }
    refresh();
  }, [ref, props.title, props.selfContained]);
  const isDisabled = !props.optional ? false : !!disabled;

  // function getSaveState(): GeneralSaveStateDTO {
  //   if (this.disabled) {
  //     return undefined;
  //   }
  //   return {
  //     ref: ref,
  //     state: this.state.state || 'off',
  //   };
  // }

  async function onModeChange(state: string): Promise<void> {
    setState(state);
    if (props.onUpdate) {
      props.onUpdate({ ref, state });
    }
    if (props.selfContained) {
      const result = await sendRequest<SwitchStateDTO>({
        method: 'put',
        url: `/entity/command/${ref}/${state}`,
      });
      setState(result.state);
    }
  }

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
        <Space style={{ margin: '0 -16px 0 16px' }}>
          {props.optional ? (
            <Switch
              defaultChecked={isDisabled}
              onChange={state => setDisabled(!state)}
            />
          ) : undefined}
          {is.undefined(props.onRemove) ? undefined : (
            <Popconfirm
              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
              title="Are you sure you want to remove this?"
              onConfirm={() => props.onRemove(ref)}
            >
              <Button size="small" type="text" danger>
                <CloseOutlined />
              </Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      <Radio.Group
        buttonStyle="solid"
        value={state}
        onChange={({ target }) => onModeChange(target.value)}
        disabled={isDisabled}
      >
        <Radio.Button value="off">Off</Radio.Button>
        <Radio.Button value="on">On</Radio.Button>
        {props.stateOnly ? undefined : (
          <Radio.Button value="toggle">Toggle</Radio.Button>
        )}
      </Radio.Group>
    </Card>
  );
}
