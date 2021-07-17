import { TokenDTO } from '@formio/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = TokenDTO & Document;

export const TokenSchema = SchemaFactory.createForClass(TokenDTO);
TokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
