import { CloseOutlined, FileAddOutlined } from '@ant-design/icons';
import { INCREMENT, INVERT_VALUE, is, START } from '@steggy/utilities';
import {
  Button,
  Divider,
  Empty,
  Input,
  List,
  Modal,
  Space,
  Spin,
  Typography,
} from 'antd';
import fuzzy from 'fuzzysort';
import parse from 'html-react-parser';
import React, { useState } from 'react';

import { domain, FD_ICONS, sendRequest } from '../../types';

const TEMP_TEMPLATE_SIZE = 3;

type tIdList = { entity_id: string; highlighted?: string }[];

function highlight(result) {
  const open = '{'.repeat(TEMP_TEMPLATE_SIZE);
  const close = '}'.repeat(TEMP_TEMPLATE_SIZE);
  let highlighted = '';
  let matchesIndex = 0;
  let opened = false;
  const { target, indexes } = result;
  for (let i = START; i < target.length; i++) {
    const char = target[i];
    if (indexes[matchesIndex] === i) {
      matchesIndex++;
      if (!opened) {
        opened = true;
        highlighted += open;
      }
      if (matchesIndex === indexes.length) {
        highlighted += char + close + target.slice(i + INCREMENT);
        break;
      }
      highlighted += char;
      continue;
    }
    if (opened) {
      opened = false;
      highlighted += close;
    }
    highlighted += char;
  }
  return highlighted.replace(
    new RegExp(`${open}(.*?)${close}`, 'g'),
    i =>
      `<span style="color:#F66">${i.slice(
        TEMP_TEMPLATE_SIZE,
        TEMP_TEMPLATE_SIZE * INVERT_VALUE,
      )}</span>`,
  );
}

// eslint-disable-next-line radar/cognitive-complexity
export function EntityModalPicker(props: {
  domains?: string[];
  exclude?: string[];
  onAdd: (selected: string[]) => void;
}) {
  const [available, setAvailable] = useState<tIdList>([]);
  const [modalVisible, setVisible] = useState<boolean>();
  const [searchText, setSearchText] = useState<string>();
  const [selected, setSelected] = useState<tIdList>([]);

  function addItem(entity_id: string): void {
    setSelected([...selected, { entity_id }]);
  }

  function fuzzySort(available: tIdList): tIdList {
    if (is.empty(searchText)) {
      return available;
    }
    const fuzzyResult = fuzzy.go(searchText, available, { key: 'entity_id' });
    const highlighted = fuzzyResult.map(result => {
      const { target } = result;
      const item = available.find(option => {
        return is.string(option)
          ? option === target
          : option.entity_id === target;
      });
      return {
        entity_id: item.entity_id,
        highlighted: highlight(result),
      };
    });
    return highlighted;
  }

  function getList() {
    const exclude = props.exclude ?? [];
    const filtered = available.filter(
      item =>
        !exclude.includes(item.entity_id) &&
        selected.every(i => item.entity_id !== i.entity_id),
    );
    if (is.empty(searchText)) {
      return filtered;
    }
    return fuzzySort(filtered);
  }
  function onComplete(): void {
    props.onAdd(selected.map(({ entity_id }) => entity_id));
    setSelected([]);
    setVisible(false);
  }

  return (
    <>
      <Button
        onClick={async e => {
          if (!is.undefined(e)) {
            e.stopPropagation();
          }
          setAvailable(undefined);
          setVisible(true);
          setSearchText('');
          setSelected([]);

          let available = await sendRequest<string[]>({ url: `/entity/list` });
          if (props.domains) {
            available = available.filter(entity_id =>
              props.domains.includes(domain(entity_id)),
            );
          }
          setAvailable(available.map(entity_id => ({ entity_id })));
        }}
        size="small"
        icon={FD_ICONS.get('plus_box')}
      >
        Add entities
      </Button>
      <Modal
        title="Entity List Builder"
        visible={modalVisible}
        onOk={() => onComplete()}
        onCancel={e => {
          if (!is.undefined(e)) {
            e.stopPropagation();
          }
          setVisible(false);
        }}
      >
        {!available ? (
          <Spin tip="Loading" />
        ) : (
          <>
            <Input
              placeholder="Filter List"
              onChange={({ target }) => setSearchText(target.value)}
              value={searchText}
              suffix={
                <Button
                  onClick={() => setSearchText('')}
                  type="text"
                  size="small"
                >
                  <CloseOutlined />
                </Button>
              }
            />
            <List
              rowKey="entity_id"
              dataSource={getList()}
              pagination={{ size: 'small' }}
              renderItem={item => (
                <List.Item>
                  <Space>
                    <Button
                      type="primary"
                      shape="round"
                      size="small"
                      onClick={() => addItem(item.entity_id)}
                      icon={<FileAddOutlined />}
                    />
                    <Typography.Text>
                      {!is.empty(item.highlighted)
                        ? parse(item.highlighted)
                        : item.entity_id}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
            <Divider />
            {is.empty(selected) ? (
              <Empty description="Nothing added yet" />
            ) : (
              <List
                rowKey="entity_id"
                dataSource={selected}
                pagination={{ size: 'small' }}
                renderItem={item => (
                  <List.Item>
                    <Space>
                      <Button
                        danger
                        shape="round"
                        type="text"
                        size="small"
                        onClick={() =>
                          setSelected(
                            selected.filter(
                              i => i.entity_id !== item.entity_id,
                            ),
                          )
                        }
                        icon={<CloseOutlined />}
                      />
                      <Typography.Text>
                        {!is.empty(item.highlighted)
                          ? parse(item.highlighted)
                          : item.entity_id}
                      </Typography.Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </Modal>
    </>
  );
}
