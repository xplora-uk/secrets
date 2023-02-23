import dotenv from 'dotenv';
import { IEnvSettings, ISecretsReader, ISecretsReaderReadInput, ISecretsReaderReadOutput, ISecretsReaderSettings } from '../../types';
import { isObject, shalllowMergeSettings } from '../utils';

export function newDotEnvSecretsReader(_settings: ISecretsReaderSettings): ISecretsReader {

  async function readSecret(input: ISecretsReaderReadInput): Promise<ISecretsReaderReadOutput> {
    let data: IEnvSettings = {}, error: Error | null = null;
    const { secretId = '.env', env = process.env, updateEnv = false } = input;

    try {

      const result = dotenv.config({ path: secretId, override: false });
      if (result) {
        if (result.parsed) data = result.parsed as IEnvSettings;
        if (result.error) error = result.error;
      }

      if (!isObject(data) || Object.getOwnPropertyNames(data).length === 0) throw new Error('Env file not found/parsed');

      if (updateEnv && isObject(env)) shalllowMergeSettings(data, env);

    } catch (err) {
      if (err instanceof Error ) error = err;
    }

    return { data, error };
  }

  return {
    _settings,
    readSecret,
  };
}
