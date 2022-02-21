import { Button, Card, DatePicker, Drawer, Form, Spin } from 'antd';
import React from 'react';
import moment from 'moment';
import { sendRequest } from '../../types';
import { HassStateDTO } from '@automagical/home-assistant-shared';

type tState = {
  from: moment.Moment;
  to: moment.Moment;
  history: HassStateDTO[];
};

export class EntityHistory extends React.Component<{ entity: string }, tState> {
  override state = {
    from: moment().subtract(1, 'day'),
    to: moment(),
    history: [],
  } as tState;

  override render() {
    return (
      <Card
        type="inner"
        title="History"
        style={{ marginTop: '16px' }}
        extra={
          <Button type="primary" size="small" onClick={() => this.refresh()}>
            Refresh
          </Button>
        }
      >
        <Form.Item label="Range">
          <DatePicker.RangePicker
            value={[this.state.from, this.state.to]}
            showTime
          />
        </Form.Item>
      </Card>
    );
  }

  private async refresh(): Promise<void> {
    const history = await sendRequest<HassStateDTO[]>(
      `/entity/history/${this.props.entity}`,
      {
        method: 'post',
        body: JSON.stringify({
          from: this.state.from.toISOString(),
          to: this.state.to.toISOString(),
        }),
      },
    );
  }
}
