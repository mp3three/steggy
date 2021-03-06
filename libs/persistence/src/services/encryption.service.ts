/* eslint-disable @typescript-eslint/no-magic-numbers */

import { Injectable } from '@nestjs/common';
import { InjectConfig } from '@steggy/boilerplate';
import { is } from '@steggy/utilities';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';
import { Binary } from 'mongodb';

import {
  CIPER_ALGORITHM,
  CIPER_KEY_SIZE,
  CIPHER_SECRET,
  SALT_END_SIZE,
  SALT_START_SIZE,
} from '../config';

@Injectable()
export class EncryptionService {
  constructor(
    @InjectConfig(CIPER_ALGORITHM)
    private readonly algorithm: string,
    @InjectConfig(CIPER_KEY_SIZE)
    private readonly keySize: number,
    @InjectConfig(CIPHER_SECRET)
    private readonly secret: string,
    @InjectConfig(SALT_START_SIZE) private readonly saltStartSize: number,
    @InjectConfig(SALT_END_SIZE) private readonly saltEndSize: number,
  ) {}

  public decrypt<T extends Record<never, unknown> = Record<string, unknown>>(
    cipherBuffer: Buffer | Binary,
    secret: string = this.secret,
  ): T {
    if (!this.isBuffer(cipherBuffer)) {
      return cipherBuffer as unknown as T;
    }
    cipherBuffer = this.coerceBuffer(cipherBuffer);

    const key = scryptSync(secret, 'GfG', this.keySize);
    const iv = Buffer.alloc(16, 0);
    const decipher = createDecipheriv(this.algorithm, key, iv);
    const decryptedJSON = Buffer.concat([
      decipher.update(cipherBuffer),
      decipher.final(),
    ]).toString();

    return JSON.parse(
      decryptedJSON.slice(this.saltStartSize, -this.saltEndSize),
    );
  }

  public encrypt(data: unknown, secret: string = this.secret): Buffer {
    if (!data) {
      return undefined;
    }
    // 🧂
    const saltStart = randomBytes(this.saltStartSize)
      .toString('hex')
      .slice(0, Math.max(0, this.saltStartSize));
    const saltEnd = randomBytes(this.saltEndSize)
      .toString('hex')
      .slice(0, Math.max(0, this.saltEndSize));

    const key = scryptSync(secret, 'GfG', this.keySize);
    const iv = Buffer.alloc(16, 0);
    const cipher = createCipheriv(this.algorithm, key, iv);

    const saveValue = saltStart + JSON.stringify(data) + saltEnd;
    return Buffer.concat([cipher.update(saveValue), cipher.final()]);
  }

  private coerceBuffer(cipherBuffer: Buffer | Binary): Buffer {
    return Buffer.isBuffer(cipherBuffer) ? cipherBuffer : cipherBuffer.buffer;
  }

  private isBuffer(cipherBuffer: Buffer | Binary): boolean {
    return (
      !cipherBuffer ||
      !(cipherBuffer instanceof Buffer || !is.undefined(cipherBuffer.buffer))
    );
  }
}
