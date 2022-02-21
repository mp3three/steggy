import { HassStateDTO } from '@automagical/home-assistant-shared';
import { is } from '@automagical/utilities';
import {
  Button,
  Card,
  DatePicker,
  Drawer,
  Form,
  List,
  notification,
  Spin,
  Table,
} from 'antd';
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
      this.setState({ history });
    } catch (err) {
      notification.error({
        message: 'Invalid history response',
        description: 'No history available?',
      });
    }
  }
}
