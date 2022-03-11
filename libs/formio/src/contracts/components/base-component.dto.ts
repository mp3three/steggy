import { ApiProperty } from '@nestjs/swagger';

import { ComponentTypes, LabelPositions } from './enums';

export class BaseComponentDTO {
  @ApiProperty({
    type: 'boolean',
  })
  public alwaysEnabled?: boolean;
  @ApiProperty()
  public attributes?: Record<string, string>;
  public className?: string;
  @ApiProperty({
    type: 'string',
  })
  public customConditional?: string;
  @ApiProperty({
    description:
      'A hidden field is still a part of the form, but is hidden from view.',
    type: 'boolean',
  })
  public hideLabel?: boolean;
  @ApiProperty()
  public id?: string;
  @ApiProperty()
  public input?: boolean;
  @ApiProperty({
    description: 'The name of this field in the API endpoint.',
    type: 'string',
  })
  public key?: string;
  @ApiProperty()
  public keyModified?: boolean;
  @ApiProperty({
    description: 'The label for this field that will appear next to it.',
    type: 'string',
  })
  public label?: string;
  @ApiProperty({
    description: 'The width of label margin on line in percentages.',
  })
  public labelMargin?: number;
  @ApiProperty({
    description: 'Position for the label for this field.',
    enum: LabelPositions,
  })
  public labelPosition?: LabelPositions;
  @ApiProperty({
    description: 'The width of label on line in percentages.',
    type: 'number',
  })
  public labelWidth?: number;
  public offset?: number;
  @ApiProperty({
    description:
      'This allows you to configure any custom properties for this component.',
  })
  public properties?: Record<string, string>;
  @ApiProperty()
  public protected?: boolean;
  @ApiProperty({
    description: 'Tag the field for use in custom logic.',
    example: ['sqlconnector', 'magic-tag'],
    type: ['string'],
  })
  public tags?: string[];
  @ApiProperty()
  public title?: string;
  @ApiProperty()
  public type?: ComponentTypes;

  public width?: number;
}
