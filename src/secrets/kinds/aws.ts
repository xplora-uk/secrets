// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { ISecretsReader, ISecretsReaderReadInput, ISecretsReaderReadOutput, ISecretsReaderSettings } from '../../types';

export function newAwsSecretsReader(_settings: ISecretsReaderSettings): ISecretsReader {

  // credentials rely on AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
  //const accessKeyId     = settings.AWS_ACCESS_KEY_ID ?? '';
  //const secretAccessKey = settings.AWS_SECRET_ACCESS_KEY ?? '';
  const region = _settings.AWS_REGION ?? 'eu-central-1';

  async function readSecret(input: ISecretsReaderReadInput): Promise<ISecretsReaderReadOutput> {
    let data: Record<string, string> = {}, error: Error | null = null;

    try {

      const client = new SecretsManagerClient({ region });

      const cmd = new GetSecretValueCommand({ SecretId: input.secretId });
      const response = await client.send(cmd);

      const secret = response.SecretString || '{}';
      data = JSON.parse(secret) as Record<string, string>;

      if (typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Invalid secret for ' + input.secretId);
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
