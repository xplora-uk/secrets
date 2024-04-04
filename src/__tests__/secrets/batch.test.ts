import dotenv from 'dotenv';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { batchReadSecrets } from '../../secrets/batch';
import { IEnvSettings } from '../../types';

dotenv.config();

describe('secrets reader in batch', () => {

  it('should read all secrets with default settings', async () => {
    const PROGRAM_NAME = 'my-test-app';
    const env: IEnvSettings = {
      ...process.env,
      PROGRAM_NAME,
    };
    const result = await batchReadSecrets({
      env,
    });
    strictEqual(result.errors.map(e => e.message).join(''), '');
    strictEqual(result.errors.length, 0);
    strictEqual(env.DEFAULT_SETTING1, 'default1');
    strictEqual(env.DEFAULT_SETTING2, 'default2-shared');
    strictEqual(env.DEFAULT_SETTING3, 'default3-secret');
    strictEqual(env.DEFAULT_SETTING4, 'default4-dotenv');
    strictEqual(env.SECRET1, 'test111');
    strictEqual(env.SECRET2, 'test222');
    strictEqual(env.SHARED_SECRET_FROM_JSON1, 'shared secret');
    strictEqual(env.APP_SECRET_FROM_JSON1, 'app secret');
    strictEqual(env.PROGRAM_NAME_EXT, `${PROGRAM_NAME}-ext`);
  });

});
