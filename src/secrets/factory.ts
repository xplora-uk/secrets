import { SECRETS_READER_DEFAULT_KIND, SECRETS_READER_VALID_KINDS } from './constants';
import { ISecretsReader, ISecretsReaderSettings, SecretsReaderKindEnum } from '../types';
import { newAwsSecretsReader } from './kinds/aws';
import { newDotEnvSecretsReader } from './kinds/dotEnvFile';
import { newProcessEnvSecretsReader } from './kinds/processEnv';
import { newJsonFileReader } from './kinds/jsonFile';

// TODO: use partial input?
export function newSecretsReader(settings: ISecretsReaderSettings): ISecretsReader {

  const { kind = SECRETS_READER_DEFAULT_KIND } = settings;

  // TODO: use some required props
  const _settings: ISecretsReaderSettings = {
    ...settings,
    kind,
  };

  switch (_settings.kind) {
    case SecretsReaderKindEnum.AWS: return newAwsSecretsReader(_settings);
    case SecretsReaderKindEnum.DOT_ENV: return newDotEnvSecretsReader(_settings);
    case SecretsReaderKindEnum.JSON_FILE: return newJsonFileReader(_settings);
    case SecretsReaderKindEnum.PROCESS_ENV: return newProcessEnvSecretsReader(_settings);
  }

  throw new Error('Uknown secrets reader kind');
}
