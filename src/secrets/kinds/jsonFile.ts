import { readFileSync } from 'fs';
import { IEnvSettings, ISecretsReader, ISecretsReaderReadInput, ISecretsReaderReadOutput, ISecretsReaderSettings } from '../../types';
import { isObject, shallowMergeSettings } from '../utils';

export function newJsonFileReader(_settings: ISecretsReaderSettings): ISecretsReader {

  async function readSecret(input: ISecretsReaderReadInput): Promise<ISecretsReaderReadOutput> {
    let data: IEnvSettings = {}, error: Error | null = null;
    const { secretId = '_secrets.json', env = process.env, updateEnv = false } = input;

    try {

      const result = readFileSync(secretId).toString('utf8');
      data = JSON.parse(result) as IEnvSettings;

      if (!isObject(data) || Object.getOwnPropertyNames(data).length === 0) throw new Error('Secret not found');

      if (updateEnv && isObject(env)) {
        shallowMergeSettings(data, env);
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
