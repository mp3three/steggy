import { ApiProperty } from '@nestjs/swagger';

import { ComponentTypes, LabelPositions } from './enums';

export class BaseComponentDTO {
  // #region Object Properties

  @ApiProperty()
  public attributes?: Record<string, string>;
  @ApiProperty()
  public id?: string;
  @ApiProperty()
  public input?: boolean;
  @ApiProperty()
  public keyModified?: boolean;
  @ApiProperty()
  public protected?: boolean;
  @ApiProperty()
  public title?: string;
  @ApiProperty()
  public type?: ComponentTypes;
  @ApiProperty({
    description:
      'A hidden field is still a part of the form, but is hidden from view.',
    type: 'boolean',
  })
  public hideLabel?: boolean;
  @ApiProperty({
    description:
      'This allows you to configure any custom properties for this component.',
  })
  public properties?: Record<string, string>;
  @ApiProperty({
    description: 'Position for the label for this field.',
    enum: LabelPositions,
  })
  public labelPosition?: LabelPositions;
  @ApiProperty({
    description: 'Tag the field for use in custom logic.',
    example: ['sqlconnector', 'magic-tag'],
    type: ['string'],
  })
  public tags?: string[];
  @ApiProperty({
    description: 'The label for this field that will appear next to it.',
    type: 'string',
  })
  public label?: string;
  @ApiProperty({
    description: 'The name of this field in the API endpoint.',
    type: 'string',
  })
  public key?: string;
  @ApiProperty({
    description: 'The width of label margin on line in percentages.',
  })
  public labelMargin?: number;
  @ApiProperty({
    description: 'The width of label on line in percentages.',
    type: 'number',
  })
  public labelWidth?: number;
  @ApiProperty({
    type: 'boolean',
  })
  public alwaysEnabled?: boolean;
  @ApiProperty({
    type: 'string',
  })
  public customConditional?: string;

  public className?: string;
  public offset?: number;
  public pull?: number;
  public push?: number;
  public width?: number;

  // #endregion Object Properties
}
