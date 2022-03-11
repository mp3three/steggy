import { Card, Col, Row } from 'antd';
import React from 'react';

type tState = {
  name: string;
};

export class IntegrationSettings extends React.Component<
  { prop?: unknown },
  tState
> {
  override state = {} as tState;

  override render() {
    return (
      <Row>
        <Col span={12}>
          <Card type="inner" title="Google Calendar">
            TODO
          </Card>
        </Col>
      </Row>
    );
  }
}
