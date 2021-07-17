import { SessionDTO } from '@formio/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = SessionDTO & Document;

export const SessionSchema = SchemaFactory.createForClass(SessionDTO);
