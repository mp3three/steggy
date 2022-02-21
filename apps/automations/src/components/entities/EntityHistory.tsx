import { HassStateDTO } from '@automagical/home-assistant-shared';
import { Button, Card, DatePicker, Drawer, Form, Spin } from 'antd';
import moment from 'moment';
import React from 'react';

import { sendRequest } from '../../types';

type tState = {
  from: moment.Moment;
  to: moment.Moment;
  history: HassStateDTO[];
};

export class EntityHistory extends React.Component<{ entity: string }, tState> {
  override state = {
    from: moment().subtract(1, 'day'),
    history: [],
    to: moment(),
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
        body: JSON.stringify({
          from: this.state.from.toISOString(),
          to: this.state.to.toISOString(),
        }),
        method: 'post',
      },
    );
  }
}
