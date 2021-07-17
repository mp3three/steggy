import {
  ActionDTO,
  ActionItemDTO,
  FormDTO,
  HANDLERS,
  SubmissionDTO,
} from '../formio-sdk';
import { ACTION_METHOD } from '../server';

/**
 * Starting with those provided by class-validator, but will expand to locally created ones
 */
export enum ValidatorAnnotations {
  /**
   * Checks if value is defined (!== undefined, !== null).
   * This is the only decorator that ignores skipMissingProperties option.
   */
  IsDefined = 'IsDefined',
  /**
   * Checks if given value is empty (=== null, === undefined) and if so, ignores all the validators on the property.
   */
  IsOptional = 'IsOptional',
  IsNumber = 'IsNumber',
  IsString = 'IsString',
  IsBoolean = 'IsBoolean',
  IsArray = 'IsArray',
  MaxLength = 'MaxLength',
  MinLength = 'MinLength',
  Equals = 'Equals',
  NotEquals = 'NotEquals',
  IsEmpty = 'IsEmpty',
  IsNotEmpty = 'IsNotEmpty',
  IsIn = 'IsIn',
  IsNotIn = 'IsNotIn',
  IsDate = 'IsDate',
  IsEnum = 'IsEnum',
  IsDivisibleBy = 'IsDivisibleBy',
  IsPositive = 'IsPositive',
  Min = 'Min',
  Max = 'Max',
  MinDate = 'MinDate',
  MaxDate = 'MaxDate',
  IsBooleanString = 'IsBooleanString',
  IsDateString = 'IsDateString',
  IsNumberString = 'IsNumberString',
  Contains = 'Contains',
  NotContains = 'NotContains',
  IsAlpha = 'IsAlpha',
  IsAlphanumeric = 'IsAlphanumeric',
  IsDecimal = 'IsDecimal',
  IsAscii = 'IsAscii',
  IsBase32 = 'IsBase32',
  IsBase64 = 'IsBase64',
  IsIBAN = 'IsIBAN',
  IsBIC = 'IsBIC',
  IsByteLength = 'IsByteLength',
  IsCreditCard = 'IsCreditCard',
  IsCurrency = 'IsCurrency',
  IsEthererumAddress = 'IsEthererumAddress',
  IsBtcAddress = 'IsBtcAddress',
  IsDataURI = 'IsDataURI',
  IsFQDN = 'IsFQDN',
  IsFullWidth = 'IsFullWidth',
  IsHalfWidth = 'IsHalfWidth',
  IsVariableWidth = 'IsVariableWidth',
  IsHexColor = 'IsHexColor',
  IsHSLColor = 'IsHSLColor',
  IsRgbColor = 'IsRgbColor',
  IsIdentityCard = 'IsIdentityCard',
  IsPassportNumber = 'IsPassportNumber',
  IsPostalCode = 'IsPostalCode',
  IsHexadecimal = 'IsHexadecimal',
  IsOctal = 'IsOctal',
  IsMACAddress = 'IsMACAddress',
  IsIP = 'IsIP',
  IsPort = 'IsPort',
  IsISBN = 'IsISBN',
  IsEAN = 'IsEAN',
  IsISIN = 'IsISIN',
  IsISO8601 = 'IsISO8601',
  IsJSON = 'IsJSON',
  IsJWT = 'IsJWT',
  IsObject = 'IsObject',
  IsNotEmptyObject = 'IsNotEmptyObject',
  IsLowerCase = 'IsLowerCase',
  IsLatLong = 'IsLatLong',
  IsLatitude = 'IsLatitude',
  IsLongitude = 'IsLongitude',
  IsMobilePhone = 'IsMobilePhone',
  IsISO31661Alpha2 = 'IsISO31661Alpha2',
  IsISO31661Alpha3 = 'IsISO31661Alpha3',
  IsLocale = 'IsLocale',
  IsPhoneNumber = 'IsPhoneNumber',
  IsMongoId = 'IsMongoId',
  IsMultibyte = 'IsMultibyte',
  IsSurrogatePair = 'IsSurrogatePair',
  IsUrl = 'IsUrl',
  IsMagnetURI = 'IsMagnetURI',
  IsUUID = 'IsUUID',
  IsFirebasePushId = 'IsFirebasePushId',
  IsUpperCase = 'IsUpperCase',
  Length = 'Length',
  Matches = 'Matches',
  IsMilitaryTime = 'IsMilitaryTime',
  IsHash = 'IsHash',
  IsMimeType = 'IsMimeType',
  IsISSN = 'IsISSN',
  IsISRC = 'IsISRC',
  IsRFC3339 = 'IsRFC3339',
  ArrayContains = 'ArrayContains',
  ArrayNotContains = 'ArrayNotContains',
  ArrayNotEmpty = 'ArrayNotEmpty',
  ArrayMinSize = 'ArrayMinSize',
  ArrayMaxSize = 'ArrayMaxSize',
  ArrayUnique = 'ArrayUnique',
  IsInstance = 'IsInstance',
  Allow = 'Allow',
}
export enum SwaggerAnnotations {
  ApiProperty = 'ApiProperty',
  ApiPropertyOptional = 'ApiPropertyOptional',
  ApiHideProperty = 'ApiHideProperty',
}
export enum TransformerAnnotations {
  Type = 'Type',
}
export const LIB_VALIDATOR_IMPORT = '@automagical/wrapper';
export const LIB_SWAGGER_IMPORT = '@nestjs/swagger';
export const LIB_TRANSFORMER = 'class-transformer';
export type AnnotationsList = ValidatorAnnotations | SwaggerAnnotations;
export interface FormValidator {
  // #region Public Methods

  validate(form: FormDTO, submission: SubmissionDTO): Promise<SubmissionDTO>;

  // #endregion Public Methods
}
export const FormValidator = Symbol('FormValidator');
export interface ActionRunner {
  // #region Public Methods

  runForm(
    method: ACTION_METHOD,
    handler?: HANDLERS,
    actions?: ActionDTO[],
  ): Promise<ActionItemDTO[]>;

  // #endregion Public Methods
}
export const ActionRunner = Symbol('ActionRunner');
