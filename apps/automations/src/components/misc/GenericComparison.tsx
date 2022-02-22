import {
  RoutineAttributeComparisonDTO,
  RoutineComparisonDTO,
  RoutineRelativeDateComparisonDTO,
  RoutineStateComparisonDTO,
  RoutineTemplateComparisonDTO,
  RoutineWebhookComparisonDTO,
} from '@automagical/controller-shared';
import { Button, Drawer, Typography } from 'antd';
import React from 'react';

import {
  AttributeComparison,
  RelativeDate,
  StateComparison,
  TemplateComparison,
  WebhookComparison,
} from './comparisons';

export class GenericComparison extends React.Component<{
  comparison: RoutineComparisonDTO;
  onCancel: () => void;
  onCommit: () => void;
  onUpdate: (comparison: RoutineComparisonDTO) => void;
  visible: boolean;
}> {
  override render() {
    return (
      <Drawer
        visible={this.props.visible}
        onClose={() => this.props.onCancel()}
        size="large"
        title={
          <Typography.Text
            editable={{
              onChange: friendlyName =>
                this.props.onUpdate({
                  ...this.props.comparison,
                  friendlyName,
                }),
            }}
          >
            {this.props.comparison.friendlyName}
          </Typography.Text>
        }
        extra={
          <>
            <Button
              type="primary"
              style={{ marginRight: '8px' }}
              onClick={() => this.props.onCommit()}
            >
              Save
            </Button>
            <Button onClick={() => this.props.onCancel()}>Cancel</Button>
          </>
        }
      >
        {this.renderComparison()}
      </Drawer>
    );
  }

  private renderComparison() {
    switch (this.props.comparison.type) {
      case 'state':
        return (
          <StateComparison
            comparison={
              this.props.comparison.comparison as RoutineStateComparisonDTO
            }
            onUpdate={part =>
              this.props.onUpdate({
                ...this.props.comparison,
                comparison: {
                  ...(this.props.comparison
                    .comparison as RoutineStateComparisonDTO),
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
              this.props.comparison.comparison as RoutineAttributeComparisonDTO
            }
            onUpdate={part =>
              this.props.onUpdate({
                ...this.props.comparison,
                comparison: {
                  ...(this.props.comparison
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
              this.props.comparison
                .comparison as RoutineRelativeDateComparisonDTO
            }
            onUpdate={part =>
              this.props.onUpdate({
                ...this.props.comparison,
                comparison: {
                  ...(this.props.comparison
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
              this.props.comparison.comparison as RoutineTemplateComparisonDTO
            }
            onUpdate={part =>
              this.props.onUpdate({
                ...this.props.comparison,
                comparison: {
                  ...(this.props.comparison
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
              this.props.comparison.comparison as RoutineWebhookComparisonDTO
            }
            onUpdate={part =>
              this.props.onUpdate({
                ...this.props.comparison,
                comparison: {
                  ...(this.props.comparison
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
}
