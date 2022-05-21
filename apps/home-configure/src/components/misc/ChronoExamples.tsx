import { Card, Divider, List, Skeleton, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { sendRequest } from '../../types';

const SINGLE_POINT = [
  'dawn',
  'today at 11:30PM',
  'tomorrow',
  'yesterday',
  'last friday at 8am',
  '5 days ago',
  '2 weeks from now',
  'Sat Aug 17 2013 18:40:39 GMT+0900 (JST)',
  '2014-11-30T08:15:30-05:30',
];
const RANGE = [
  'sunrise to sunset',
  '8am to 5pm',
  '17 August 2013 to 19 August 2013',
  'This Friday from 13:00 to 16.00',
];

export function renderDateExpression([start, end]: string[]) {
  if (!start) {
    return <Skeleton.Input style={{ width: 200 }} />;
  }
  if (end) {
    return (
      <>
        <Typography.Text code>
          {new Date(start).toLocaleString()}
        </Typography.Text>
        -
        <Typography.Text code>{new Date(end).toLocaleString()}</Typography.Text>
      </>
    );
  }
  return (
    <Typography.Text code>{new Date(start).toLocaleString()}</Typography.Text>
  );
}

export function ChronoExamples(props: { range?: boolean }) {
  const [examples, setExamples] = useState<string[][]>([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const expressionExamples = [...SINGLE_POINT, ...(props.range ? RANGE : [])];

  useEffect(() => {
    async function refresh() {
      const list = await sendRequest<string[][]>({
        body: { expression: expressionExamples },
        method: 'post',
        url: `/debug/chrono-parse`,
      });
      setExamples(list);
    }
    refresh();
    // expressionExamples gets recreated every rendering
    // DO NOT USE IT AS A DEPENDENCY HERE
    // Causes a request flood to server
    //
    // It DID get to ~400k requests in 6 hours, before crashing the tab 💪
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.range]);

  return (
    <Card
      type="inner"
      title={<Typography.Text strong>Examples</Typography.Text>}
      style={{ marginTop: '16px' }}
    >
      <List
        pagination={{ size: 'small' }}
        dataSource={examples}
        renderItem={(expression, index) => (
          <List.Item>
            <List.Item.Meta
              title={
                <Typography.Text strong>
                  {expressionExamples[index]}
                </Typography.Text>
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
