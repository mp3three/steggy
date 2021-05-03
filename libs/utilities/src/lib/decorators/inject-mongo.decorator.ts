import { Inject } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';

export function InjectMongo(cls: { name: string }): ReturnType<typeof Inject> {
  return Inject(getModelToken(cls.name));
}
InjectMongo.token = (cls: { name: string }) => {
  return getModelToken(cls.name);
};
