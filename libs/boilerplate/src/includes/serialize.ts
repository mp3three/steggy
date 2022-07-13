import { ClassConstructor, plainToInstance } from 'class-transformer';
import { gunzipSync, gzipSync } from 'zlib';

/**
 * Minimal set of functions to serialize / unserialize misc data.
 *
 * Utilizes with a gzip + base64 combo to reduce the size by approx 75%
 *
 *  **Example comparison**
 *  - plain json: `140559` characters
 *  - base64: `36616` characters
 */
export const SERIALIZE = {
  serialize: (data: unknown): string =>
    gzipSync(Buffer.from(JSON.stringify(data), 'utf8')).toString('base64'),
  unserialize: <T>(
    /** Raw text to unserialize */
    data: string,
    /**
     * Annotated class for class-transformer to cast to.
     * Can be used for object validation (don't trust data!)
     * */
    dto?: ClassConstructor<T>,
  ): T => {
    const out = JSON.parse(gunzipSync(Buffer.from(data, 'base64')).toString());
    if (dto) {
      return plainToInstance(dto, out);
    }
    return out;
  },
};
