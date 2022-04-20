import { GROUP_TYPES } from '@steggy/controller-shared';
import { Descriptions, Typography } from 'antd';
import React from 'react';

export const GROUP_DESCRIPTIONS = new Map<`${GROUP_TYPES}`, React.ReactElement>(
  [
    [
      'light',
      <Descriptions bordered title="Light Groups" style={{ textAlign: 'left' }}>
        <Descriptions.Item label="Domains" span={3}>
          <Typography.Text code>light</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={3}>
          <Typography.Text>
            Light groups can coordinate light entities, setting color and
            brightness.
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Special Actions" span={3}>
          <Typography>
            <Typography.Paragraph>
              Special actions this group type makes available to routines.
            </Typography.Paragraph>
          </Typography>
          <Descriptions>
            <Descriptions.Item span={3}>
              <Typography>
                <Typography.Title level={5}>Dim up / down</Typography.Title>
                <Typography.Paragraph>
                  Change the brightness of all group members by a predetermined
                  amount.
                </Typography.Paragraph>
              </Typography>
            </Descriptions.Item>
          </Descriptions>
        </Descriptions.Item>
      </Descriptions>,
    ],
    [
      'switch',
      <Descriptions
        bordered
        title="Switch Groups"
        style={{ textAlign: 'left' }}
      >
        <Descriptions.Item label="Domains" span={3}>
          <Typography.Text code>light</Typography.Text>
          <Typography.Text code>switch</Typography.Text>
          <Typography.Text code>fan</Typography.Text>
          <Typography.Text code>climate</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={3}>
          <Typography.Paragraph>
            Switch groups can coordinate the enabled state for several domains.
            Different domains may react differently to being turned on.
          </Typography.Paragraph>
          <Typography.Paragraph>
            For example, lights usually restore their previous brightness, while
            fans usually default to maximum speed.
          </Typography.Paragraph>
        </Descriptions.Item>
      </Descriptions>,
    ],
    [
      'fan',
      <Descriptions bordered title="Fan Groups" style={{ textAlign: 'left' }}>
        <Descriptions.Item label="Domains" span={3}>
          <Typography.Text code>fan</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={3}>
          <Typography.Paragraph>
            Fan groups are for coordinating several fan entities.
          </Typography.Paragraph>
        </Descriptions.Item>
      </Descriptions>,
    ],
    [
      'lock',
      <Descriptions bordered title="Lock Groups" style={{ textAlign: 'left' }}>
        <Descriptions.Item label="Domains" span={3}>
          <Typography.Text code>fan</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Description" span={3}>
          <Typography.Paragraph>
            Lock groups are for coordinating several lock entities.
          </Typography.Paragraph>
        </Descriptions.Item>
      </Descriptions>,
    ],
  ],
);
