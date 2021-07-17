import { ActionDTO } from '@formio/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActionDocument = ActionDTO & Document;

export const ActionSchema = SchemaFactory.createForClass(ActionDTO);
