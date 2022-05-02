import {
  MetadataComparisonDTO,
  RoutineAttributeComparisonDTO,
  RoutineComparisonDTO,
  RoutineRelativeDateComparisonDTO,
  RoutineStateComparisonDTO,
  RoutineTemplateComparisonDTO,
  RoutineWebhookComparisonDTO,
} from '@steggy/controller-shared';
import { Button, Drawer, Typography } from 'antd';

import {
  AttributeComparison,
  RelativeDate,
  RoomMetadataComparison,
  StateComparison,
  TemplateComparison,
  WebhookComparison,
} from './comparisons';

export function GenericComparison(props: {
  comparison: RoutineComparisonDTO;
  onCancel: () => void;
  onCommit: () => void;
  onUpdate: (comparison: RoutineComparisonDTO) => void;
  visible: boolean;
}) {
  function onCommit(): void {
    props.onCommit();
  }

  function renderComparison() {
    switch (props.comparison.type) {
      case 'metadata':
        return (
          <RoomMetadataComparison
            comparison={props.comparison.comparison as MetadataComparisonDTO}
            onUpdate={part =>
              props.onUpdate({
                ...props.comparison,
                comparison: {
                  ...(props.comparison.comparison as MetadataComparisonDTO),
                  ...part,
                },
              })
            }
          />
        );
      case 'state':
        return (
          <StateComparison
            comparison={
              props.comparison.comparison as RoutineStateComparisonDTO
            }
            onUpdate={part =>
              props.onUpdate({
                ...props.comparison,
                comparison: {
                  ...(props.comparison.comparison as RoutineStateComparisonDTO),
                  ...part,
                },
              })
            }
          />
        );
      case 'attribute':
        return (
          <AttributeComparison
            comparison={
              props.comparison.comparison as RoutineAttributeComparisonDTO
            }
            onUpdate={part =>
              props.onUpdate({
                ...props.comparison,
                comparison: {
                  ...(props.comparison
                    .comparison as RoutineAttributeComparisonDTO),
                  ...part,
                },
              })
            }
          />
        );
      case 'date':
        return (
          <RelativeDate
            comparison={
              props.comparison.comparison as RoutineRelativeDateComparisonDTO
            }
            onUpdate={part =>
              props.onUpdate({
                ...props.comparison,
                comparison: {
                  ...(props.comparison
                    .comparison as RoutineRelativeDateComparisonDTO),
                  ...part,
                },
              })
            }
          />
        );
      case 'template':
        return (
          <TemplateComparison
            comparison={
              props.comparison.comparison as RoutineTemplateComparisonDTO
            }
            onUpdate={part =>
              props.onUpdate({
                ...props.comparison,
                comparison: {
                  ...(props.comparison
                    .comparison as RoutineTemplateComparisonDTO),
                  ...part,
                },
              })
            }
          />
        );
      case 'webhook':
        return (
          <WebhookComparison
            comparison={
              props.comparison.comparison as RoutineWebhookComparisonDTO
            }
            onUpdate={part =>
              props.onUpdate({
                ...props.comparison,
                comparison: {
                  ...(props.comparison
                    .comparison as RoutineWebhookComparisonDTO),
                  ...part,
                },
              })
            }
          />
        );
    }
    return undefined;
  }

  return (
    <Drawer
      visible={props.visible}
      onClose={() => props.onCancel()}
      size="large"
      title={
        <Typography.Text
          editable={{
            onChange: friendlyName =>
              props.onUpdate({
                ...props.comparison,
                friendlyName,
              }),
          }}
        >
          {props.comparison.friendlyName}
        </Typography.Text>
      }
      extra={
        <>
          <Button
            type="primary"
            style={{ marginRight: '8px' }}
            onClick={() => onCommit()}
          >
            Save
          </Button>
          <Button onClick={() => props.onCancel()}>Cancel</Button>
        </>
      }
    >
      {renderComparison()}
    </Drawer>
  );
}
