export type IEnvSettings = typeof process.env;

export enum SecretsReaderKindEnum {
  AWS = 'aws',
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
  secretId : string;
  env     ?: IEnvSettings; // defaults to process.env
}

export interface ISecretsReaderReadOutput {
  data : Record<string, string>;
  error: Error | null;
}