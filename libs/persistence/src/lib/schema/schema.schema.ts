import { SchemaDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SchemaDocument = SchemaDTO & Document;

export const SchemaSchema = SchemaFactory.createForClass(SchemaDTO);
