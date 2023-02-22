export type IEnvSettings = typeof process.env;

export enum SecretsReaderKindEnum {
  AWS         = 'aws',
  DOT_ENV     = 'dot_env',
  JSON_FILE   = 'json_file',
  PROCESS_ENV = 'process_env',
}

export type ISecretsReaderKind = keyof typeof SecretsReaderKindEnum | SecretsReaderKindEnum | string;

export interface ISecretsReader {
  _settings : ISecretsReaderSettings;
  readSecret: (args: ISecretsReaderReadInput) => Promise<ISecretsReaderReadOutput>;
}

export interface ISecretsReaderSettings extends Record<string, string | undefined> {
  /**
   * default is 'aws'
   */
  kind?: ISecretsReaderKind;

  AWS_ACCESS_KEY_ID    ?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION           ?: string;
}

export interface ISecretsReaderReadInput {
  /**
   * 1. Name/ID of AWS Secret
   * 2. path of .env file
   * 3. path of _secrets.json file
   */
  secretId: string;

  /**
   * defaults to process.env
   */
  env?: IEnvSettings;

  /**
   * defaults to false
   */
  updateEnv?: boolean;
}

export interface ISecretsReaderReadOutput {
  data : IEnvSettings;
  error: Error | null;
}
