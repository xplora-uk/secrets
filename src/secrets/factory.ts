import { SECRETS_READER_DEFAULT_KIND, SECRETS_READER_VALID_KINDS } from './constants';
import { ISecretsReader, ISecretsReaderSettings, SecretsReaderKindEnum } from '../types';
import { newAwsSecretsReader } from './kinds/aws';

export function newSecretsReader(settings: ISecretsReaderSettings): ISecretsReader {

  const { kind = SECRETS_READER_DEFAULT_KIND } = settings;

  const _settings: ISecretsReaderSettings = {
    kind,
    ...settings,
  };
  
  _settings.kind  = SECRETS_READER_VALID_KINDS.includes(String(kind)) ? kind : SECRETS_READER_DEFAULT_KIND;

  if (_settings.kind === SecretsReaderKindEnum.AWS) {
    return newAwsSecretsReader(_settings);
  }

  throw new Error('Uknown secrets reader kind');
}
