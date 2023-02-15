import dotenv from 'dotenv';
import { expect } from 'chai';
import { newSecretsReader} from '../secrets';

dotenv.config();

describe('secrets reader for AWS', () => {

  const secretsReader1 = newSecretsReader({ kind: 'aws' });
  const secretsReader2 = newSecretsReader({});

  it('should read existing secret in AWS', async () => {
    const res = await secretsReader1.readSecret({ secretId: 'test' });
    expect(res.error).to.eq(null);
    expect(res.data.SECRET1).to.eq('test111');
    expect(res.data.SECRET2).to.eq('test222');
  });

  it('should read existing secret in env', async () => {
    const res = await secretsReader1.readSecret({ secretId: 'my_app', env: process.env });
    expect(res.error).to.eq(null);
    expect(res.data.PASSWORD).to.eq('pass1234');
  });

  it('should fail to read invalid secret', async () => {
    const res = await secretsReader2.readSecret({ secretId: 'test1234' });
    expect(res.error instanceof Error).to.eq(true);
  });

  it('should read existing secret in AWS and update env', async () => {
    const env: Record<string, string> = {};
    const res = await secretsReader1.readSecret({ secretId: 'test', env, updateEnv: true });
    expect(res.error).to.eq(null);
    expect(env.SECRET1).to.eq('test111');
    expect(env.SECRET2).to.eq('test222');
  });
});

