import { expand, DotenvPopulateInput as DotenvPopulateInputX } from 'dotenv-expand';

import { IBatchSecretsReaderInput, IBatchSecretsReaderOutput, SecretsReaderKindEnum } from '../types';
import { newSecretsReader } from './factory';

export async function batchReadSecrets(input: IBatchSecretsReaderInput): Promise<IBatchSecretsReaderOutput> {
  const errors: Array<Error> = [], updateEnv = true;
  const {
    env                    = process.env,           // if you do not want to change process.env, give input prop 'env'.
    defaultEnvSettingsFile = '_defaults.env',       // load order 1
    sharedSecretsJsonFile  = '_sharedSecrets.json', // load order 2
    sharedSecretIdOnAws    = 'shared',              // load order 3
    appSecretsJsonFile     = '_secrets.json',       // load order 4, 5 is from AWS
    dotEnvFile             = '.env',                // load order 6
  } = input;

  const dotEnvFileReader = newSecretsReader({ kind: SecretsReaderKindEnum.DOT_ENV });
  const jsonReader = newSecretsReader({ kind: 'json_file', ...env });

  try {
    
    // 1: parse _defaults.env file
    const result1 = await dotEnvFileReader.readSecret({ secretId: defaultEnvSettingsFile, env, updateEnv });
    if (result1) {
      if (result1.error) {
        errors.push(new Error('Failed to load default env settings: ' + result1.error.message));
      }
    }

    // now env is possibly updated
    const { appSecretIdOnAws = env['PROGRAM_NAME'] || '' } = input; // for loader order 5
    const awsReader = newSecretsReader({ kind: 'aws', ...env });

    // 2: read shared secret from local file
    const result2 = await jsonReader.readSecret({ secretId: sharedSecretsJsonFile, env, updateEnv });
    if (result2.error) {
      errors.push(new Error('Failed to read shared secret JSON file: ' + result2.error.message));
    }

    // 3: read shared secret from AWS
    const result3 = await awsReader.readSecret({ secretId: sharedSecretIdOnAws, env, updateEnv });
    if (result3 && result3.error) {
      errors.push(new Error('Failed to read shared secret (' + sharedSecretIdOnAws + '): ' + result3.error.message));
    }

    // 4: read secret from local file for this app
    const result4 = await jsonReader.readSecret({ secretId: appSecretsJsonFile, env, updateEnv });
    if (result4 && result4.error) {
      errors.push(new Error('Failed to read app secret JSON file: ' + result4.error.message));
    }

    // 5: read secret from AWS for this app
    const result5 = await awsReader.readSecret({ secretId: appSecretIdOnAws, env, updateEnv });
    if (result5 && result5.error) {
      errors.push(new Error('Failed to read app secret (' + appSecretIdOnAws + ') on AWS: ' + result5.error.message ));
    }

    // 6: parse .env if it exists on local dev machine
    const result6 = await dotEnvFileReader.readSecret({ secretId: dotEnvFile, env, updateEnv });
    if (result6 && result6.error) {
      errors.push(new Error('Failed to load default env settings: ' + result6.error.message));
    }

    // 7: expand variables
    const result7 = expand({ parsed: env as Record<string, string>, processEnv: env as DotenvPopulateInputX });
    if (result7 && result7.error) {
      errors.push(new Error('Failed to load default env settings: ' + result7.error.message));
    }

  } catch (err) {
    if (err instanceof Error) errors.push(err);
  }

  return { errors };
}
