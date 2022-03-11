import { KunamiCodeActivateDTO } from '@automagical/controller-shared';
import { eachSeries, is, PEAT, sleep } from '@automagical/utilities';
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
import React from 'react';

import { sendRequest } from '../../../types';
import { FuzzySelect } from '../../misc';

type tState = {
  entityList: string[];
  event?: string;
  isRecording?: boolean;
  match: string[];
  name?: string;
  recordLabel?: string;
  recordProgress?: number;
  recordSeconds: number;
  reset?: 'self' | 'sensor';
  sensor: string;
};

export class RoutineActivateKunami extends React.Component<
  { activate?: KunamiCodeActivateDTO },
  tState
> {
  override state = {
    entityList: [],
    match: [],
    recordProgress: 30,
    recordSeconds: 5,
  } as tState;

  private matchList: typeof Form.List;

  override async componentDidMount(): Promise<void> {
    await this.entityList();
    if (this.props.activate) {
      this.load(this.props.activate);
    }
  }

  public getValue(): KunamiCodeActivateDTO {
    if (is.empty(this.state.sensor) || is.empty(this.state.match)) {
      return undefined;
    }
    return {
      match: this.state.match,
      reset: this.state.reset,
      sensor: this.state.sensor,
    };
  }

  public load(activate: KunamiCodeActivateDTO): void {
    this.setState(activate);
  }

  override render() {
    return (
      <>
        <Form.Item label="Listen entity" rules={[{ required: true }]}>
          <FuzzySelect
            onChange={sensor => this.setState({ sensor })}
            value={this.state.sensor}
            data={this.state.entityList.map(id => ({ text: id, value: id }))}
          />
        </Form.Item>
        <Form.Item label="Reset" rules={[{ required: true }]}>
          <Radio.Group
            value={this.state.reset || 'none'}
            onChange={({ target }) => this.setState({ reset: target.value })}
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
                value={this.state.match.join(`\n`)}
                onChange={e =>
                  this.setState({
                    match: e.target.value.split(`\n`),
                  })
                }
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Slider
              value={this.state.recordSeconds}
              onChange={recordSeconds => this.setState({ recordSeconds })}
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
            <Button onClick={this.record.bind(this)}>Record for seconds</Button>
          </Col>
        </Row>
        <Modal
          visible={this.state.isRecording}
          title="Recording states..."
          maskClosable={false}
          centered
          // eslint-disable-next-line unicorn/no-null
          footer={null}
        >
          <Progress
            type="circle"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            format={() => this.state.recordLabel}
            percent={this.state.recordProgress}
          />
        </Modal>
      </>
    );
  }

  private async entityList(): Promise<void> {
    const entityList = await sendRequest<string[]>({ url: `/entity/list` });
    this.setState({ entityList });
  }

  private async record(): Promise<void> {
    if (is.empty(this.state.sensor)) {
      notification.error({
        message: `Select an entity!`,
      });
      return;
    }
    const { recordSeconds, sensor } = this.state;
    await Promise.all([
      (async () => {
        const steps = recordSeconds * 10;
        this.setState({ isRecording: true, recordProgress: 0 });
        await eachSeries(PEAT(recordSeconds * 10), async i => {
          await sleep(100);
          this.setState({
            recordLabel: (Math.floor((steps - i) / 10) + 1).toString(),
            recordProgress: Math.floor((i / steps) * 100),
          });
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
        console.log(match);
        this.setState({ match });
      })(),
    ]);
    this.setState({ isRecording: false });
  }
}
