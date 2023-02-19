import dotenv from 'dotenv';
import { expect } from 'chai';
import { newSecretsReader} from '../secrets';

dotenv.config();

describe('secrets reader for AWS', () => {

  const secretsReader1 = newSecretsReader({ kind: 'aws' });
  const secretsReader2 = newSecretsReader({ kind: 'aws', AWS_REGION: 'eu-west-1' });
  const secretsReader3 = newSecretsReader({});

  it('should read existing secret in AWS', async () => {
    let error: Error | null = null;
    try {
      const unknown = newSecretsReader({ kind: 'unknown' });
    } catch (err) {
      error = err instanceof Error ? err : null;
    }
    expect(error instanceof Error).to.eq(true);
  });

  it('should read existing secret in AWS', async () => {
    const res = await secretsReader1.readSecret({ secretId: 'test' });
    expect(res.error).to.eq(null);
    expect(res.data.SECRET1).to.eq('test111');
    expect(res.data.SECRET2).to.eq('test222');
  });

  it('should read existing secret in AWS - with region - not found', async () => {
    const res = await secretsReader2.readSecret({ secretId: 'test' });
    expect(res.error !== null).to.eq(true);
    expect('SECRET1' in res.data).to.eq(false);
  });

  it('should read existing secret in env - invalid json', async () => {
    const env: Record<string, string> = {
      ...process.env,
      my_app2: '{',
    };
    const res = await secretsReader1.readSecret({ secretId: 'my_app2', env, updateEnv: false });
    expect(res.error instanceof Error).to.eq(true);
    expect('PASSWORD' in res.data).to.eq(false);
  });

  it('should read existing secret in env - not found', async () => {
    const env: Record<string, string> = {};
    const res = await secretsReader1.readSecret({ secretId: 'my_app2', env, updateEnv: false });
    expect(res.error instanceof Error).to.eq(true);
    expect('PASSWORD' in res.data).to.eq(false);
  });

  it('should read existing secret in env - no update', async () => {
    const env: Record<string, string> = {
      ...process.env,
      my_app2: '{ "PASSWORD": "pass1234"}',
    };
    const res = await secretsReader1.readSecret({ secretId: 'my_app2', env, updateEnv: false });
    expect(res.error).to.eq(null);
    expect(res.data.PASSWORD).to.eq('pass1234');
  });

  it('should read existing secret in env - update', async () => {
    const env: Record<string, string> = {
      ...process.env,
      my_app2: '{ "PASSWORD": "pass1234"}',
    };
    const res = await secretsReader1.readSecret({ secretId: 'my_app2', env, updateEnv: true });
    expect(res.error).to.eq(null);
    expect(res.data.PASSWORD).to.eq('pass1234');
    expect(env['PASSWORD']).to.eq('pass1234');
  });

  it('should fail to read invalid secret', async () => {
    const res = await secretsReader2.readSecret({ secretId: 'test1234' });
    expect(res.error instanceof Error).to.eq(true);
  });

  it('should read existing secret in AWS - no update env', async () => {
    const env: Record<string, string> = {};
    const res = await secretsReader1.readSecret({ secretId: 'test', env, updateEnv: false });
    expect(res.error).to.eq(null);
    expect(res.data.SECRET1).to.eq('test111');
    expect(res.data.SECRET2).to.eq('test222');
  });

  it('should read existing secret in AWS - update env', async () => {
    const env: Record<string, string> = {};
    const res = await secretsReader1.readSecret({ secretId: 'test', env, updateEnv: true });
    expect(res.error).to.eq(null);
    expect(res.data.SECRET1).to.eq('test111');
    expect(res.data.SECRET2).to.eq('test222');
    expect(env.SECRET1).to.eq('test111');
    expect(env.SECRET2).to.eq('test222');
  });
  it('should read existing secret in AWS and update env', async () => {
    const env: Record<string, string> = {};
    const res = await secretsReader1.readSecret({ secretId: 'test', env, updateEnv: true });
    expect(res.error).to.eq(null);
    expect(env.SECRET1).to.eq('test111');
    expect(env.SECRET2).to.eq('test222');
  });
});

