import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { existsSync } from 'fs';

import { IBatchSecretsReaderInput, IBatchSecretsReaderOutput } from '../types';
import { newSecretsReader } from './factory';
import { shallowMergeSettings } from './utils';

export async function batchReadSecrets(input: IBatchSecretsReaderInput): Promise<IBatchSecretsReaderOutput> {
  const errors: Array<Error> = [], updateEnv = true;
  const {
    env                    = process.env,           // if you do not want to change process.env, give input prop 'env'.
    defaultEnvSettingsFile = '_defaults.env',       // load order 1
    sharedSecretsJsonFile  = '_sharedSecrets.json', // load order 2
    sharedSecretIdOnAws    = 'shared',              // load order 3
    appSecretsJsonFile     = '_secrets.json',       // load order 4
    dotEnvFile             = '.env',                // load order 6
  } = input;

  try {
    if (existsSync(defaultEnvSettingsFile)) {
      // 1: parse _defaults.env file
      const result1 = config({ path: defaultEnvSettingsFile, override: false });
      if (result1) {
        if (result1.parsed) shallowMergeSettings(result1.parsed, env);
        if (result1.error) errors.push(new Error('Failed to load default env settings: ' + result1.error.message));
      }
    } else {
      errors.push(new Error('Missing default env settings file: ' + defaultEnvSettingsFile));
    }

    // now env is possibly updated
    const { appSecretIdOnAws = env['PROGRAM_NAME'] || '' } = input; // load order 5

    const jsonReader = newSecretsReader({ kind: 'json_file', ...env });
    const awsReader  = newSecretsReader({ kind: 'aws', ...env });

    // 2: read shared secret from local file
    const sharedJsonResult = await jsonReader.readSecret({ secretId: sharedSecretsJsonFile, env, updateEnv });
    if (sharedJsonResult.error) {
      errors.push(new Error('Failed to read shared secret JSON file: ' + sharedJsonResult.error.message));
    }

    // 3: read shared secret from AWS
    const secretShared = await awsReader.readSecret({ secretId: sharedSecretIdOnAws, env, updateEnv });
    if (secretShared.error) {
      errors.push(new Error('Failed to read shared secret (' + sharedSecretIdOnAws + '): ' + secretShared.error.message));
    }

    // 4: read secret from local file for this app
    const secretsJsonResult = await jsonReader.readSecret({ secretId: appSecretsJsonFile, env, updateEnv });
    if (secretsJsonResult.error) {
      errors.push(new Error('Failed to read app secret JSON file: ' + secretsJsonResult.error.message));
    }

    // 5: read secret from AWS for this app
    const secret = await awsReader.readSecret({ secretId: appSecretIdOnAws, env, updateEnv });
    if (secret.error) {
      errors.push(new Error('Failed to read app secret (' + appSecretIdOnAws + ') on AWS: ' + secret.error.message ));
    }

    // 6: parse .env if it exists on local dev machine
    if (existsSync(dotEnvFile)) {
      const result2 = config({ path: dotEnvFile, override: false });
      if (result2) {
        if (result2.parsed) shallowMergeSettings(result2.parsed, env);
        if (result2.error) errors.push(new Error('Failed to load default env settings: ' + result2.error.message));
      }
    } else {
      errors.push(new Error('Missing env settings file: ' + dotEnvFile));
    }

    // 7: expand variables
    const result3 = expand({ parsed: env as Record<string, string> });
    if (result3) {
      if (result3.parsed) shallowMergeSettings(result3.parsed, env);
      if (result3.error) errors.push(new Error('Failed to load default env settings: ' + result3.error.message));
    }

  } catch (err) {
    if (err instanceof Error) errors.push(err);
  }

  return { errors };
}
