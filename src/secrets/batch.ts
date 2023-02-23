import { config } from 'dotenv';
import { existsSync } from 'fs';

import { IBatchSecretsReaderInput, IBatchSecretsReaderOutput } from '../types';
import { newSecretsReader } from './factory';
import { shalllowMergeSettings } from './utils';

export async function batchReadSecrets(input: IBatchSecretsReaderInput): Promise<IBatchSecretsReaderOutput> {
  const errors: Array<Error> = [], updateEnv = true;
  const {
    env                    = process.env,
    defaultEnvSettingsFile = '_defaults.env',       // load order 1
    sharedSecretsJsonFile  = '_sharedSecrets.json', // load order 2
    sharedSecretIdOnAws    = 'shared',              // load order 3
    appSecretsJsonFile     = '_secrets.json',       // load order 4
    dotEnvFile             = '.env',                // load order 6
  } = input;
  const { appSecretIdOnAws = env['PROGRAM_NAME'] || '' } = input; // load order 5

  try {
    if (existsSync(defaultEnvSettingsFile)) {
      // LOAD 1: parse _defaults.env file
      const result1 = config({ path: defaultEnvSettingsFile, override: false });
      if (result1) {
        if (result1.parsed) shalllowMergeSettings(result1.parsed, env);
        if (result1.error) errors.push(new Error('Failed to load default env settings: ' + result1.error.message));
      }
    } else {
      errors.push(new Error('Missing default env settings file: ' + defaultEnvSettingsFile));
    }

    const awsReader = newSecretsReader({ kind: 'aws' });
    const jsonReader = newSecretsReader({ kind: 'json_file' });

    // LOAD 2: read shared secret from local file
    const sharedJsonResult = await jsonReader.readSecret({ secretId: sharedSecretsJsonFile, env, updateEnv });
    if (sharedJsonResult.error) {
      errors.push(new Error('Failed to read shared secret JSON file: ' + sharedJsonResult.error.message));
    }

    // LOAD 3: read shared secret from AWS
    const secretShared = await awsReader.readSecret({ secretId: sharedSecretIdOnAws, env, updateEnv });
    if (secretShared.error) {
      errors.push(new Error('Failed to read shared secret (' + sharedSecretIdOnAws + '): ' + secretShared.error.message));
    }

    // LOAD 4: read secret from local file for this app
    const secretsJsonResult = await jsonReader.readSecret({ secretId: appSecretsJsonFile, env, updateEnv });
    if (secretsJsonResult.error) {
      errors.push(new Error('Failed to read app secret JSON file: ' + secretsJsonResult.error.message));
    }

    // LOAD 5: read secret from AWS for this app
    const secret = await awsReader.readSecret({ secretId: appSecretIdOnAws, env, updateEnv });
    if (secret.error) {
      errors.push(new Error('Failed to read app secret (' + appSecretIdOnAws + ') on AWS: ' + secret.error.message ));
    }

    // LOAD 6: parse .env if it exists on local dev machine
    if (existsSync(dotEnvFile)) {
      const result2 = config({ path: dotEnvFile, override: false });
      if (result2) {
        if (result2.parsed) shalllowMergeSettings(result2.parsed, env);
        if (result2.error) errors.push(new Error('Failed to load default env settings: ' + result2.error.message));
      }
    } else {
      errors.push(new Error('Missing env settings file: ' + dotEnvFile));
    }
  } catch (err) {
    if (err instanceof Error) errors.push(err);
  }

  return { errors };
}
