import dotenv from 'dotenv';
import { IEnvSettings, ISecretsReader, ISecretsReaderReadInput, ISecretsReaderReadOutput, ISecretsReaderSettings } from '../../types';
import { isObject, shalllowMergeSettings } from '../utils';

export function newDotEnvSecretsReader(_settings: ISecretsReaderSettings): ISecretsReader {

  async function readSecret(input: ISecretsReaderReadInput): Promise<ISecretsReaderReadOutput> {
    let data: IEnvSettings = {}, error: Error | null = null;
    const { secretId = '.env', env = process.env, updateEnv = false } = input;

    try {

      const result = dotenv.config({ path: secretId, override: false });
      data = (result.parsed || {}) as IEnvSettings;

      if (!isObject(data) || Object.getOwnPropertyNames(data).length === 0) throw new Error('Secret not found');

      if (updateEnv && isObject(env)) {
        shalllowMergeSettings(data, env);
      }

    } catch (err) {
      error = err instanceof Error ? err : null;
    }

    return { data, error };
  }

  return {
    _settings,
    readSecret,
  };
}
