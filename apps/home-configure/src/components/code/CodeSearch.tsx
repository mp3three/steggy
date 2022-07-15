import { is } from '@steggy/utilities';
import { Button, Form, Input, Popover, Select, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';

import { FD_ICONS, sendRequest } from '../../types';

export type CodeSearchUpdateProps = {
  code: string;
  name: string;
  tags: string[];
  type: string;
};

export function CodeSearch(props: {
  onUpdate: (props: CodeSearchUpdateProps) => void;
}) {
  const [nameText, setNameText] = useState('');
  const [codeType, setCodeType] = useState('');
  const [inCode, setInCode] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    async function refresh() {
      const response = await sendRequest<{ tags: string[] }>({
        url: `/code/tags`,
      });
      setAllTags(response.tags);
    }
    refresh();
  }, []);

  function clear() {
    setNameText('');
    setInCode('');
    setCodeType('');
    setSelectedTags([]);
  }

  function update() {
    props.onUpdate({
      code: inCode,
      name: nameText,
      tags: selectedTags,
      type: codeType,
    });
  }

  return (
    <Popover
      placement="rightTop"
      title={
        <Typography.Title level={4}>
          {FD_ICONS.get('search')}
          {` Search`}
        </Typography.Title>
      }
      content={
        <Space direction="vertical" style={{ width: '30vw' }}>
          <Form.Item label="In Name">
            <Input
              value={nameText}
              onChange={({ target }) => setNameText(target.value)}
            />
          </Form.Item>
          <Form.Item label="Type">
            <Select value={codeType} onChange={value => setCodeType(value)}>
              <Select.Option value="">Any</Select.Option>
              <Select.Option value="request">Request</Select.Option>
              <Select.Option value="execute">Execute</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="In Code">
            <Input
              value={inCode}
              onChange={({ target }) => setInCode(target.value)}
            />
          </Form.Item>
          {is.empty(allTags) ? undefined : (
            <Form.Item label="Tags">
              <Select
                mode="tags"
                value={selectedTags}
                onChange={value => setSelectedTags(is.unique(value))}
              >
                {allTags.map(tag => (
                  <Select.Option value={tag} key={tag}>
                    {tag}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Space style={{ float: 'right' }}>
            <Button type="primary" size="small" onClick={() => update()}>
              Search
            </Button>
            <Button
              size="small"
              onClick={() => clear()}
              disabled={
                is.empty(nameText) &&
                is.empty(codeType) &&
                is.empty(inCode) &&
                is.empty(selectedTags)
              }
            >
              Clear
            </Button>
          </Space>
        </Space>
      }
    >
      <Button icon={FD_ICONS.get('search')} type="text" size="small" />
    </Popover>
  );
}
