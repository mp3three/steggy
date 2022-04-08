import { HassStateDTO } from '@steggy/home-assistant-shared';
import { is } from '@steggy/utilities';
import { Button, Card, DatePicker, Form, notification, Table } from 'antd';
import moment from 'moment';
import React from 'react';

import { sendRequest } from '../../types';

type tState = {
  from: moment.Moment;
  history: HassStateDTO[];
  to: moment.Moment;
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
          <Button
            type="primary"
            size="small"
            onClick={() => this.refresh()}
            disabled={is.empty(this.props.entity)}
          >
            Refresh
          </Button>
        }
      >
        <Form.Item label="Range">
          <DatePicker.RangePicker
            value={[this.state.from, this.state.to]}
            onChange={this.onRangeChange.bind(this)}
            onCalendarChange={this.onRangeChange.bind(this)}
            showTime
          />
        </Form.Item>
        <Table dataSource={this.filterHistory()}>
          <Table.Column title="State" dataIndex="state" key="state" />
          <Table.Column
            title="Date Changed"
            dataIndex="last_changed"
            key="last_changed"
          />
        </Table>
      </Card>
    );
  }

  private filterHistory() {
    let last: unknown;
    const filtered = this.state.history.filter(i => {
      if (i.state === last) {
        return false;
      }
      last = i.state;
      return true;
    });
    return filtered;
  }

  private onRangeChange([from, to]: [moment.Moment, moment.Moment]): void {
    console.log(from, to);
    this.setState({ from, to });
  }

  private async refresh(): Promise<void> {
    try {
      const history = await sendRequest<HassStateDTO[]>({
        body: {
          from: this.state.from.toISOString(),
          to: this.state.to.toISOString(),
        },
        method: 'post',
        url: `/entity/history/${this.props.entity}`,
      });
      this.setState({ history });
    } catch {
      notification.error({
        description: 'No history available?',
        message: 'Invalid history response',
      });
    }
  }
}
