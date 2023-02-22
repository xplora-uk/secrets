import { IEnvSettings, ISecretsReader, ISecretsReaderReadInput, ISecretsReaderReadOutput, ISecretsReaderSettings } from '../../types';
import { isObject, shalllowMergeSettings } from '../utils';

export function newProcessEnvSecretsReader(_settings: ISecretsReaderSettings): ISecretsReader {

  async function readSecret(input: ISecretsReaderReadInput): Promise<ISecretsReaderReadOutput> {
    let data: IEnvSettings = {}, error: Error | null = null, secret = '';
    const { secretId, env = process.env, updateEnv = false } = input;

    try {

      if ((secretId in env) && env[secretId] && (typeof env[secretId] === 'string')) {
        secret = String(env[secretId]);
      }

      if (secret === '') throw new Error('Secret not found: ' + secretId);

      data = JSON.parse(secret) as IEnvSettings;

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
