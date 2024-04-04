import dotenv from 'dotenv';
import { strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { newSecretsReader } from '../../secrets/factory';

dotenv.config();

describe('secrets reader for AWS', () => {

  const secretsReader1 = newSecretsReader({ kind: 'aws' });
  const secretsReader2 = newSecretsReader({ kind: 'aws', AWS_REGION: 'eu-west-2' });
  const secretsReader3 = newSecretsReader({ kind: 'process_env' });

  it('should read existing secret in AWS', async () => {
    let error: Error | null = null;
    try {
      const unknown = newSecretsReader({ kind: 'unknown' });
    } catch (err) {
      error = err instanceof Error ? err : null;
    }
    strictEqual(error instanceof Error, true);
  });

  it('should read existing secret in AWS', async () => {
    const res = await secretsReader1.readSecret({ secretId: 'my-test-app' });
    strictEqual(res.error, null);
    strictEqual(res.parsed.SECRET1, 'test111');
    strictEqual(res.parsed.SECRET2, 'test222');
  });

  it('should read existing secret in AWS - with region - not found', async () => {
    const res = await secretsReader2.readSecret({ secretId: 'my-test-app' });
    strictEqual(res.error !== null, true);
    strictEqual('SECRET1' in res.parsed, false);
  });

  it('should read existing secret in env - invalid json', async () => {
    const env: Record<string, string> = {
      ...process.env,
      my_app2: '{',
    };
    const res = await secretsReader1.readSecret({ secretId: 'my_app2', env, updateEnv: false });
    strictEqual(res.error instanceof Error, true);
    strictEqual('PASSWORD' in res.parsed, false);
  });

  it('should read existing secret in env - not found', async () => {
    const env: Record<string, string> = {};
    const res = await secretsReader3.readSecret({ secretId: 'my_app2', env, updateEnv: false });
    strictEqual(res.error instanceof Error, true);
    strictEqual('PASSWORD' in res.parsed, false);
  });

  it('should read existing secret in env - no update', async () => {
    const env: Record<string, string> = {
      ...process.env,
      my_app2: '{ "PASSWORD": "pass1234"}',
    };
    const res = await secretsReader3.readSecret({ secretId: 'my_app2', env, updateEnv: false });
    strictEqual(res.error, null);
    strictEqual(res.parsed.PASSWORD, 'pass1234');
  });

  it('should read existing secret in env - update', async () => {
    const env: Record<string, string> = {
      ...process.env,
      my_app2: '{ "PASSWORD": "pass1234"}',
    };
    const res = await secretsReader3.readSecret({ secretId: 'my_app2', env, updateEnv: true });
    strictEqual(res.error, null);
    strictEqual(res.parsed.PASSWORD, 'pass1234');
    strictEqual(env['PASSWORD'], 'pass1234');
  });

  it('should fail to read invalid secret', async () => {
    const res = await secretsReader2.readSecret({ secretId: 'test1234' });
    strictEqual(res.error instanceof Error, true);
  });

  it('should read existing secret in AWS - no update env', async () => {
    const env: Record<string, string> = {};
    const res = await secretsReader1.readSecret({ secretId: 'my-test-app', env, updateEnv: false });
    strictEqual(res.error, null);
    strictEqual(res.parsed.SECRET1, 'test111');
    strictEqual(res.parsed.SECRET2, 'test222');
  });

  it('should read existing secret in AWS - update env', async () => {
    const env: Record<string, string> = {};
    const res = await secretsReader1.readSecret({ secretId: 'my-test-app', env, updateEnv: true });
    strictEqual(res.error, null);
    strictEqual(res.parsed.SECRET1, 'test111');
    strictEqual(res.parsed.SECRET2, 'test222');
    strictEqual(env.SECRET1, 'test111');
    strictEqual(env.SECRET2, 'test222');
  });
  it('should read existing secret in AWS and update env', async () => {
    const env: Record<string, string> = {};
    const res = await secretsReader1.readSecret({ secretId: 'my-test-app', env, updateEnv: true });
    strictEqual(res.error, null);
    strictEqual(env.SECRET1, 'test111');
    strictEqual(env.SECRET2, 'test222');
  });
});

