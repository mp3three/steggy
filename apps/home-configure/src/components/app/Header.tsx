import { START } from '@steggy/utilities';
import { Avatar, Col, Layout, Row, Typography } from 'antd';

import { CurrentUserContext } from '../../types';

export function Header() {
  return (
    <Layout.Header>
      <CurrentUserContext.Consumer>
        {({ person }) => (
          <Row>
            <Col span={20}>
              <Typography.Title level={2} style={{ padding: '8px' }}>
                Automation Controller
              </Typography.Title>
            </Col>
            <Col span={4}>
              <Avatar style={{ marginRight: '8px' }}>
                {(person?.friendlyName ?? '?').charAt(START)}
              </Avatar>
              <Typography.Text strong>
                {person?.friendlyName ?? (
                  <Typography.Text code>None Selected</Typography.Text>
                )}
              </Typography.Text>
            </Col>
          </Row>
        )}
      </CurrentUserContext.Consumer>
    </Layout.Header>
  );
}
