import { is } from '@steggy/utilities';
import { Card, Divider, List, Skeleton, Typography } from 'antd';
import { parse } from 'chrono-node';
import React from 'react';

const single = [
  'today at 11:30PM',
  'tomorrow',
  'yesterday',
  'last friday at 8am',
  '5 days ago',
  '2 weeks from now',
  'Sat Aug 17 2013 18:40:39 GMT+0900 (JST)',
  '2014-11-30T08:15:30-05:30',
];
const range = [
  '8am - 5pm',
  '17 August 2013 - 19 August 2013',
  'This Friday from 13:00 - 16.00',
];

export function renderDateExpression(expression: string) {
  if (is.empty(expression)) {
    return <Skeleton.Input style={{ width: 200 }} />;
  }
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

export function ChronoExamples(props: { range?: boolean }) {
  return (
    <Card type="inner" title="Examples" style={{ marginTop: '16px' }}>
      <List
        dataSource={[...single, ...(props.range ? range : [])]}
        renderItem={expression => (
          <List.Item>
            <List.Item.Meta
              title={
                <Typography.Title level={5}>{expression}</Typography.Title>
              }
            />
            {renderDateExpression(expression)}
          </List.Item>
        )}
      />
      <Divider orientation="left">Custom Resolvers</Divider>
      <Typography.Text type="secondary">
        The controller will also resolve these strings in addition to the
        examples above. Values will be calculated using current day as reference
        point due to internal library limitations. Expressions such as "2 months
        from now at sunset" won't be accurate.
      </Typography.Text>
      <ul>
        <li>dawn</li>
        <li>dusk</li>
        <li>sunrise</li>
        <li>sunset</li>
      </ul>
    </Card>
  );
}
