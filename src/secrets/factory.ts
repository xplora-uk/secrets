import { SECRETS_READER_DEFAULT_KIND, SECRETS_READER_VALID_KINDS } from './constants';
import { ISecretsReader, ISecretsReaderSettings, SecretsReaderKindEnum } from '../types';
import { newAwsSecretsReader } from './kinds/aws';

// TODO: use partial input?
export function newSecretsReader(settings: ISecretsReaderSettings): ISecretsReader {

  const { kind = SECRETS_READER_DEFAULT_KIND } = settings;

  // TODO: use some required props
  const _settings: ISecretsReaderSettings = {
    ...settings,
    kind,
  };

  if (_settings.kind === SecretsReaderKindEnum.AWS) {
    return newAwsSecretsReader(_settings);
  }

  throw new Error('Uknown secrets reader kind');
}
