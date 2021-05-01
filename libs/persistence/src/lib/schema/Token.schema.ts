import { TokenDTO } from '@automagical/contracts/formio-sdk';
import { SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = TokenDTO & Document;

export const TokenDocument = SchemaFactory.createForClass(TokenDTO);
TokenDocument.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
