import dotenv from 'dotenv';
import { expect } from 'chai';
import { batchReadSecrets } from '../../secrets/batch';
import { IEnvSettings } from '../../types';

dotenv.config();

describe('secrets reader in batch', () => {

  it('should read all secrets with default settings', async () => {
    const env: IEnvSettings = {
      ...process.env,
      PROGRAM_NAME: 'my-test-app',
    };
    const result = await batchReadSecrets({
      env,
    });
    expect(result.errors.map(e => e.message).join('')).to.eq('');
    expect(result.errors.length).to.eq(0);
    expect(env.DEFAULT_SETTING1).to.eq('default1');
    expect(env.SECRET1).to.eq('test111');
    expect(env.SECRET2).to.eq('test222');
    expect(env.SHARED_SECRET_FROM_JSON1).to.eq('shared secret');
    expect(env.APP_SECRET_FROM_JSON1).to.eq('app secret');
  });

});
