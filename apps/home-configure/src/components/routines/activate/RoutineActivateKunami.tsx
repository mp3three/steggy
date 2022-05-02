import { SequenceActivateDTO } from '@steggy/controller-shared';
import { eachSeries, is, PEAT, sleep } from '@steggy/utilities';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  notification,
  Progress,
  Radio,
  Row,
  Slider,
} from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../../types';
import { FuzzySelect } from '../../misc';

export function RoutineActivateKunami(props: {
  activate: SequenceActivateDTO;
  onUpdate: (activate: Partial<SequenceActivateDTO>) => void;
}) {
  const [entityList, setEntityList] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>();
  const [recordLabel, setRecordLabel] = useState<string>();
  const [recordProgress, setRecordProgress] = useState<number>();
  const [recordSeconds, setRecordSeconds] = useState<number>();

  useEffect(() => {
    async function entityList(): Promise<void> {
      setEntityList(await sendRequest<string[]>({ url: `/entity/list` }));
    }
    entityList();
  }, []);

  async function record(): Promise<void> {
    if (is.empty(props.activate?.sensor)) {
      notification.error({
        message: `Select an entity!`,
      });
      return;
    }
    const { sensor } = props.activate;
    await Promise.all([
      (async () => {
        const steps = recordSeconds * 10;
        setIsRecording(true);
        setRecordProgress(0);
        await eachSeries(PEAT(recordSeconds * 10), async i => {
          await sleep(100);
          setRecordLabel((Math.floor((steps - i) / 10) + 1).toString());
          setRecordProgress(Math.floor((i / steps) * 100));
        });
      })(),
      (async () => {
        const match = await sendRequest<string[]>({
          body: {
            duration: recordSeconds,
          },
          method: 'post',
          url: `/entity/record/${sensor}`,
        });
        props.onUpdate({ match });
      })(),
    ]);
    setIsRecording(false);
  }

  return (
    <>
      <Form.Item label="Listen entity" rules={[{ required: true }]}>
        <FuzzySelect
          onChange={sensor => props.onUpdate({ sensor })}
          value={props.activate?.sensor}
          data={entityList.map(id => ({ text: id, value: id }))}
        />
      </Form.Item>
      <Form.Item label="Reset" rules={[{ required: true }]}>
        <Radio.Group
          buttonStyle="solid"
          value={props.activate?.reset || 'none'}
          onChange={({ target }) => props.onUpdate({ reset: target.value })}
        >
          <Radio.Button value="none">None</Radio.Button>
          <Radio.Button value="self">Self</Radio.Button>
          <Radio.Button value="sensor">Sensor</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Divider orientation="left">Match states</Divider>
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item label="States">
            <Input.TextArea
              value={(props.activate?.match ?? []).join(`\n`)}
              style={{ minHeight: '250px' }}
              onBlur={({ target }) =>
                props.onUpdate({
                  match: target.value.split(`\n`),
                })
              }
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Slider
            value={recordSeconds}
            onChange={recordSeconds => setRecordSeconds(recordSeconds)}
            marks={{
              150: '150',
              30: '30',
              300: '300',
              5: '5',
              60: '60',
            }}
            min={5}
            max={300}
          />
          <Button onClick={() => record()}>Record for seconds</Button>
        </Col>
      </Row>
      <Modal
        visible={isRecording}
        title="Recording states..."
        maskClosable={false}
        centered
        footer={null}
      >
        <Progress
          type="circle"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          format={() => recordLabel}
          percent={recordProgress}
        />
      </Modal>
    </>
  );
}
