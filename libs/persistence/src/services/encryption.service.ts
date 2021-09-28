/* eslint-disable @typescript-eslint/no-magic-numbers */

import { InjectConfig, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
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

  @Trace()
  public decrypt<T extends Record<never, unknown> = Record<string, unknown>>(
    cipherbuffer: Buffer | Binary,
    secret: string = this.secret,
  ): T {
    if (!this.isBuffer(cipherbuffer)) {
      return cipherbuffer as unknown as T;
    }
    cipherbuffer = this.coerceBuffer(cipherbuffer);

    const key = scryptSync(secret, 'GfG', this.keySize);
    const iv = Buffer.alloc(16, 0);
    const decipher = createDecipheriv(this.algorithm, key, iv);
    const decryptedJSON = Buffer.concat([
      decipher.update(cipherbuffer),
      decipher.final(),
    ]).toString();

    return JSON.parse(
      decryptedJSON.slice(this.saltStartSize, -this.saltEndSize),
    );
  }

  @Trace()
  public encrypt(
    data: Record<string, unknown>,
    secret: string = this.secret,
  ): Buffer {
    if (!data) {
      return;
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

  private coerceBuffer(cipherbuffer: Buffer | Binary): Buffer {
    return Buffer.isBuffer(cipherbuffer) ? cipherbuffer : cipherbuffer.buffer;
  }

  private isBuffer(cipherbuffer: Buffer | Binary): boolean {
    return (
      !cipherbuffer ||
      !(
        cipherbuffer instanceof Buffer ||
        typeof cipherbuffer.buffer !== undefined
      )
    );
  }
}