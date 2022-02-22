import { RoutineRelativeDateComparisonDTO } from '@automagical/controller-shared';
import {
  Card,
  Divider,
  Form,
  Input,
  List,
  Radio,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import { parse } from 'chrono-node';
import React from 'react';

export class RelativeDate extends React.Component<{
  comparison: RoutineRelativeDateComparisonDTO;
  onUpdate: (value: Partial<RoutineRelativeDateComparisonDTO>) => void;
}> {
  override render() {
    return (
      <>
        <Card title="Relative Date Comparison" type="inner">
          <Form.Item label="Comparison">
            <Tooltip
              title={
                <Typography>
                  <Typography.Paragraph>
                    <Typography.Text code>before</Typography.Text> /{' '}
                    <Typography.Text code>after</Typography.Text>: if the
                    expression results in a range, start date is used
                  </Typography.Paragraph>
                  <Divider />
                  <Typography.Paragraph>
                    <Typography.Text code>in range</Typography.Text>: if the
                    expression does NOT result in a range, it will be treated
                    the same as <Typography.Text code>after</Typography.Text>
                  </Typography.Paragraph>
                  <Divider />
                  <Typography.Paragraph>
                    <Typography.Text code>not in range</Typography.Text>: if the
                    expression does NOT result in a range, it will be treated
                    the same as <Typography.Text code>before</Typography.Text>
                  </Typography.Paragraph>
                </Typography>
              }
            >
              <Radio.Group
                value={this.props.comparison.dateType}
                onChange={({ target }) =>
                  this.props.onUpdate({ dateType: target.value })
                }
              >
                <Radio.Button value="after">After</Radio.Button>
                <Radio.Button value="before">Before</Radio.Button>
                <Radio.Button value="in_range">In Range</Radio.Button>
                <Radio.Button value="not_in_range">Not In Range</Radio.Button>
              </Radio.Group>
            </Tooltip>
          </Form.Item>
          <Form.Item label="Expression">
            <Input
              value={this.props.comparison.expression}
              onChange={({ target }) =>
                this.props.onUpdate({ expression: target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Current Value">
            {this.renderDateExpression(
              this.props.comparison.expression as string,
            )}
          </Form.Item>
        </Card>
        <Card type="inner" title="Examples" style={{ marginTop: '16px' }}>
          <List
            dataSource={[
              'today at 11:30PM',
              '8am - 5pm',
              'tomorrow',
              'yesterday',
              'last friday at 8am',
              '17 August 2013 - 19 August 2013',
              'This Friday from 13:00 - 16.00',
              '5 days ago',
              '2 weeks from now',
              'Sat Aug 17 2013 18:40:39 GMT+0900 (JST)',
              '2014-11-30T08:15:30-05:30',
            ]}
            renderItem={expression => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Typography.Title level={5}>{expression}</Typography.Title>
                  }
                />
                {this.renderDateExpression(expression)}
              </List.Item>
            )}
          />
        </Card>
      </>
    );
  }

  private renderDateExpression(expression: string) {
    const [parsed] = parse(expression);
    if (!parsed) {
      return <Skeleton.Input style={{ width: 200 }} />;
    }
    if (parsed.end) {
      return (
        <>
          <Typography.Text code>
            {parsed.start.date().toLocaleString()}
          </Typography.Text>
          -
          <Typography.Text code>
            {parsed.end.date().toLocaleString()}
          </Typography.Text>
        </>
      );
    }
    return (
      <Typography.Text code>
        {parsed.start.date().toLocaleString()}
      </Typography.Text>
    );
  }
}
