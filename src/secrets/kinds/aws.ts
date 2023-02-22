// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { IEnvSettings, ISecretsReader, ISecretsReaderReadInput, ISecretsReaderReadOutput, ISecretsReaderSettings } from '../../types';
import { isObject, shalllowMergeSettings } from '../utils';

export function newAwsSecretsReader(_settings: ISecretsReaderSettings): ISecretsReader {

  // credentials rely on AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
  //const accessKeyId     = settings.AWS_ACCESS_KEY_ID ?? '';
  //const secretAccessKey = settings.AWS_SECRET_ACCESS_KEY ?? '';
  const region = _settings.AWS_REGION ?? 'eu-central-1';

  async function readSecret(input: ISecretsReaderReadInput): Promise<ISecretsReaderReadOutput> {
    let data: IEnvSettings = {}, error: Error | null = null, secret = '';
    const { secretId, env = process.env, updateEnv = false } = input;

    try {

      // find in AWS Secrets Manager
      const client = new SecretsManagerClient({ region });
      const cmd = new GetSecretValueCommand({ SecretId: secretId });
      const response = await client.send(cmd);
      secret = response.SecretString || '';

      if (secret === '') throw new Error('Secret not found: ' + input.secretId);

      data = JSON.parse(secret) as Record<string, string>;

      if (updateEnv && isObject(env)) {
        shalllowMergeSettings(data, env);
      }

    } catch (err) {
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      error = err instanceof Error ? err : null;
    }

    return { data, error };
  }

  return {
    _settings,
    readSecret,
  };
}
