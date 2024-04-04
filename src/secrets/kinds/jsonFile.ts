import { readFileSync } from 'fs';
import { IEnvSettings, ISecretsReader, ISecretsReaderReadInput, ISecretsReaderReadOutput, ISecretsReaderSettings } from '../../types';
import { isObject, shallowMergeSettings } from '../utils';

export function newJsonFileReader(_settings: ISecretsReaderSettings): ISecretsReader {

  async function readSecret(input: ISecretsReaderReadInput): Promise<ISecretsReaderReadOutput> {
    let parsed: IEnvSettings = {}, error: Error | null = null;
    const { secretId = '_secrets.json', env = process.env, updateEnv = false } = input;

    try {

      const result = readFileSync(secretId).toString('utf8');
      parsed = JSON.parse(result) as IEnvSettings;

      if (!isObject(parsed) || Object.getOwnPropertyNames(parsed).length === 0) throw new Error('Secret not found');

      if (updateEnv && isObject(env)) {
        shallowMergeSettings(parsed, env);
      }

    } catch (err) {
      error = err instanceof Error ? err : null;
    }

    return { parsed, error };
  }

  return {
    _settings,
    readSecret,
  };
}
