import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import {
  KunamiCodeActivateDTO,
  SolarActivateDTO,
} from '@text-based/controller-shared';
import { eachSeries, is, PEAT, sleep } from '@text-based/utilities';
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
  Select,
  Slider,
  Space,
} from 'antd';
import React from 'react';
import SolarCalc from 'solar-calc/types/solarCalc';

import { sendRequest } from '../../../types';

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
    match: ['1', '2'],
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

  public getValue(): SolarActivateDTO {
    if (is.empty(this.state.event)) {
      return undefined;
    }
    return { event: this.state.event as keyof SolarCalc };
  }

  public load(activate: KunamiCodeActivateDTO): void {
    this.setState(activate);
  }

  override render() {
    return (
      <>
        <Form.Item label="Listen entity" rules={[{ required: true }]}>
          <Select
            onChange={sensor => this.setState({ sensor })}
            showSearch
            filterOption={(input, option) =>
              option.children
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            value={this.state.sensor}
          >
            {this.state.entityList.map(id => (
              <Select.Option key={id} value={id}>
                {id}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Reset" rules={[{ required: true }]}>
          <Radio.Group value={this.state.reset || 'none'}>
            <Radio.Button value="none">None</Radio.Button>
            <Radio.Button value="self">Self</Radio.Button>
            <Radio.Button value="sensor">Sensor</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Divider orientation="left">Match states</Divider>
        <Row gutter={16}>
          <Col span={16}>
            <Form.List name="match" initialValue={this.state.match}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(field => (
                    <Form.Item
                      {...field}
                      label="State"
                      rules={[{ required: true }]}
                    >
                      <Space>
                        <Input value={field.name} />
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                        />
                      </Space>
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add state
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
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
    const entityList = await sendRequest<string[]>(`/entity/list`);
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
      async () => {
        const steps = recordSeconds * 10;
        this.setState({ isRecording: true, recordProgress: 0 });
        await eachSeries(PEAT(recordSeconds * 10), async i => {
          await sleep(100);
          console.log(Math.floor(steps / i));
          this.setState({
            recordLabel: (Math.floor((steps - i) / 10) + 1).toString(),
            recordProgress: Math.floor((i / steps) * 100),
          });
        });
      },
      async () => {
        const match = await sendRequest<string[]>(`/entity/record/${sensor}`, {
          body: JSON.stringify({
            duration: recordSeconds,
          }),
          method: 'post',
        });
        console.log(match);
      },
    ]);
    this.setState({ isRecording: false });
  }
}
