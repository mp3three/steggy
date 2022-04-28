import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { GeneralSaveStateDTO } from '@steggy/controller-shared';
import { LockStateDTO } from '@steggy/home-assistant-shared';
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
import React, { useEffect, useState } from 'react';

import { sendRequest } from '../../types';

export function LockEntityCard(props: {
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
  const [state, setState] = useState<string>(props?.state?.state);
  const isDisabled = !props.optional ? false : !!disabled;
  const ref = props?.state?.ref;

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  // override async componentDidMount(): Promise<void> {
  //   this.setState({
  //     state: props?.state?.state,
  //   });
  //   if (props.optional) {
  //     this.setState({
  //       disabled: is.undefined(props.state?.state),
  //     });
  //   }
  //   await refresh();
  // }

  async function onModeChange(state: string): Promise<void> {
    setState(state);
    if (props.onUpdate) {
      props.onUpdate({ ref: ref, state });
    }
    if (props.selfContained) {
      const result = await sendRequest<LockStateDTO>({
        method: 'put',
        url: `/entity/command/${ref}/${state}`,
      });
      setState(result.state);
    }
  }

  async function refresh(): Promise<void> {
    if (!is.empty(props.title)) {
      setFriendlyName(props.title);
      return;
    }
    const entity = await sendRequest<LockStateDTO>({
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
    setState(entity.state);
  }

  if (is.empty(friendly_name)) {
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
              defaultChecked={!disabled}
              onChange={disable => setDisabled(!disable)}
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
        <Radio.Button value="locked">Lock</Radio.Button>
        <Radio.Button value="unlocked">Unlock</Radio.Button>
      </Radio.Group>
    </Card>
  );
}
