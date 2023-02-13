import dotenv from 'dotenv';
import { expect } from 'chai';
import { newSecretsReader} from '../secrets';

dotenv.config();

describe('secrets reader for AWS', () => {

  const secretsReader1 = newSecretsReader({ kind: 'aws' });
  const secretsReader2 = newSecretsReader({});

  it('should read existing secret', async () => {
    const res = await secretsReader1.readSecret({ secretId: 'test' });
    expect(res.error).to.eq(null);
    expect(res.data.SECRET1).to.eq('test111');
    expect(res.data.SECRET2).to.eq('test222');
  });

  it('should fail to read invalid secret', async () => {
    const res = await secretsReader2.readSecret({ secretId: 'test1234' });
    expect(res.error instanceof Error).to.eq(true);
  });

});

