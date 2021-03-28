import { env, Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import { ClientOpts, createClient, RedisClient } from 'redis';

interface iCacheItem {
  // #region Object Properties

  item: string;
  lastUpdate: string;

  // #endregion Object Properties
}

/**
 * This code is legacy, typing is just so I can figure out wtf is going on.
 *
 * It's a PITA to work with, let's hope it doesn't need tweaks after this
 */
@Injectable()
export class RedisService {
  // #region Object Properties

  private readonly config = Object.freeze({
    url: env.LICENSES_REDIS_URL,
    host: env.LICENSES_REDIS_HOST,
    port: env.LICENSES_REDIS_PORT,
    useSSL: env.LICENSES_REDIS_USESSL,
    password: env.LICENSES_REDIS_PASSWORD,
  });
  private readonly logger = Logger(RedisService);

  private db: RedisClient = null;

  // #endregion Object Properties

  // #region Public Methods

  public addMonthRecord(key: string, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve(data);
      }
      // Add this record, to the end of the list at the position of the key.
      this.db.rpush(key, JSON.stringify(data), (err, length) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });
  }

  public connect() {
    this.logger.notice('Connecting to Redis');
    if (!this.config.url) {
      this.logger.emerg('Redis not configured');
      return;
    }
    const opts = {
      retry_strategy: (options) => {
        if (options.total_retry_time > 1000 * 60 * 60) {
          this.db = null;
          this.logger.alert('Redis gone');
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 1000) {
          this.db = null;
          this.logger.alert('Max retriex exceeded');
          return undefined;
        }
        // reconnect after
        const wait = Math.min(options.attempt * 100, 3000);
        this.logger.crit(
          `Lost redis connection. Attempting to reconnect #${options.attempt} in ${wait}ms`,
          options.error ? options.error.code : 'NOERROR',
        );
        return wait;
      },
      auth_pass: this.config.password,
    } as ClientOpts;

    if (this.config.useSSL) {
      opts.tls = { servername: this.config.host };
      this.db = createClient(Number(this.config.port), this.config.host, opts);
    } else {
      this.db = createClient(this.config.url, opts);
    }

    this.db.on('ready', () => {
      this.logger.notice('Redis connection successful');
    });
    this.db.on('error', (error) => {
      this.logger.crit('Redis connection error', error);
      this.db = null;
    });
    this.db.on('end', () => {
      this.logger.notice('Redis connection closed');
      this.db = null;
    });
  }

  public countCalls(key: string): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve(0);
      }
      const transaction = this.db.multi();

      for (let day = 1; day < 32; day++) {
        transaction.llen(`${key}:${day}`);
      }

      transaction.exec((err, response) => {
        if (err) {
          return reject(err);
        }
        return resolve(response.reduce((sum, x) => sum + x, 0));
      });
    });
  }

  public async delInfo(key) {
    this.db.hdel(key, 'item');
    this.db.hdel(key, 'lastUpdate');
  }

  public disconnect() {
    if (this.db) {
      this.db.unref();
    }
  }

  public async getInfo(key: string): Promise<iCacheItem> {
    return new Promise((resolve, reject) => {
      this.db.hgetall(key, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve((result as unknown) as iCacheItem);
      });
    });
  }

  public onModuleDestroy() {
    this.disconnect();
  }

  public onModuleInit() {
    this.connect();
  }

  public setInfo(key: string, info) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve(info);
      }
      this.db.hmset(key, info, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  public totalDelete(set, member) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve(true);
      }

      this.db.zrem(set, member, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  public totalDisable(set, member) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve(true);
      }
      this.db.zadd(set, 0, member, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  public totalEnable(set, member) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve(true);
      }
      this.db.zadd(set, 1, member, (err, result) => {
        if (err) {
          return reject(err);
        }
        return resolve(result);
      });
    });
  }

  public totalEnabled(set): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve(0);
      }
      this.db.zcount(set, 1, 1, (err, length) => {
        if (err) {
          return reject(err);
        }
        return resolve(length);
      });
    });
  }

  public totalList(set, type) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve([]);
      }
      this.db.zrangebyscore(set, 0, 1, 'WITHSCORES', (err, results) => {
        if (err) {
          return reject(err);
        }

        const transaction = this.db.multi();
        const statuses = {};

        for (let x = 0; x < results.length; x += 2) {
          statuses[results[x]] = results[x + 1];
          transaction.hgetall(`info:${type}:${results[x]}`);
        }

        transaction.exec((err, utilizations) => {
          // Add enabled status to result.
          const utils = utilizations.reduce((obj, util) => {
            if (util) {
              obj[util.id] = util;
            }
            return obj;
          }, {});
          const result = Object.keys(statuses).map((id) => {
            if (utils[id]) {
              utils[id].status = statuses[id];
              return utils[id];
            } else {
              return {
                id,
                status: statuses[id],
              };
            }
          });

          if (err) {
            return reject(err);
          }
          return resolve(result);
        });
      });
    });
  }

  public totalStatus(set, member) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return resolve('1');
      }
      this.db.zscore(set, member, (err, score) => {
        if (err) {
          return reject(err);
        }
        return resolve(score);
      });
    });
  }

  // #endregion Public Methods
}
