// ? Just doing the type, shouldn't affect the build
// ? It's too much of a mess to find a refactor for this without breaking linting somewhere
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import type { VersionResponse } from '@steggy/server';
import { is } from '@steggy/utilities';
import {
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, IsAuthContext, sendRequest } from '../../types';
import { SelectedPerson } from './SelectedPerson';

export function ConnectionSettings() {
  const [version, setVersion] = useState<VersionResponse>();
  useEffect(() => {
    async function loadVersion() {
      setVersion(
        await sendRequest({
          url: `/version`,
        }),
      );
    }
    loadVersion();
  }, []);

  return (
    <IsAuthContext.Consumer>
      {({ key, base, updateBase, updateKey }) => (
        <Row gutter={[8, 24]}>
          <Col span={10} offset={2}>
            <Card
              title={
                <Typography.Text strong>
                  {is.empty(key) ? <>{FD_ICONS.get('error')} </> : undefined}
                  Connection Settings
                </Typography.Text>
              }
              type="inner"
            >
              <Form.Item label="Server Admin Key">
                <Input.Password
                  defaultValue={key}
                  onBlur={({ target }) => updateKey(target.value)}
                />
              </Form.Item>
              <Form.Item
                label={
                  <Tooltip
                    title={
                      <Typography>
                        Leaving this blank is correct for most setups. Changing
                        this value will force the UI to send requests to a
                        different api target than what provided the UI.
                      </Typography>
                    }
                  >
                    Server Base URL
                  </Tooltip>
                }
              >
                <Input
                  placeholder="Leave blank for same domain / default operation"
                  defaultValue={base}
                  onBlur={({ target }) => updateBase(target.value)}
                />
              </Form.Item>
            </Card>
          </Col>
          {is.empty(key) ? undefined : (
            <Col span={10}>
              <SelectedPerson />
            </Col>
          )}
          {is.empty(key) ? undefined : (
            <Col span={10} offset={2}>
              <Card
                title={
                  <Typography.Text strong>Server Information</Typography.Text>
                }
                type="inner"
              >
                {!version ? (
                  <Skeleton active />
                ) : (
                  <Descriptions bordered>
                    <Descriptions.Item label="Server Version" span={3}>
                      <Typography.Text code>{version?.version}</Typography.Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Boot Time">
                      {new Date(version?.boot).toLocaleString()}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Card>
            </Col>
          )}
        </Row>
      )}
    </IsAuthContext.Consumer>
  );
}
