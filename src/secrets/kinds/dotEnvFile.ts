import dotenv, { DotenvPopulateInput } from 'dotenv';
import { existsSync } from 'fs';
import { IEnvSettings, ISecretsReader, ISecretsReaderReadInput, ISecretsReaderReadOutput, ISecretsReaderSettings } from '../../types';
import { isObject, shallowMergeSettings } from '../utils';

export function newDotEnvSecretsReader(_settings: ISecretsReaderSettings): ISecretsReader {

  async function readSecret(input: ISecretsReaderReadInput): Promise<ISecretsReaderReadOutput> {
    let parsed: IEnvSettings = {}, error: Error | null = null;
    const { secretId = '.env', env = process.env, updateEnv = false } = input;
    let tempEnv = { ...env };
    try {

      if (!existsSync(secretId)) {
        throw new Error('Env file not found');
      }

      const result = dotenv.config({ path: secretId, override: true, processEnv: tempEnv as DotenvPopulateInput });
      if (result) {
        if (result.parsed) parsed = result.parsed as IEnvSettings;
        if (result.error) error = result.error;
      }

      if (!isObject(parsed) || Object.getOwnPropertyNames(parsed).length === 0) {
        throw new Error('Env file not parsed');
      }

      if (updateEnv) {
        if (isObject(env)) {
          shallowMergeSettings(tempEnv, env);
        }
      }

    } catch (err) {
      if (err instanceof Error ) error = err;
    }

    return { parsed, error };
  }

  return {
    _settings,
    readSecret,
  };
}
