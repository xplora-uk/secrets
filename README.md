# secrets

use AWS SDK and read settings from Secrets Manager

## DEV

Check code inside `src`.

### requirements for dev

* Node v16+

### install, build, configure, test

```sh
npm run install
npm run build
```

```sh
cp _sample.env .env
# edit it
```

Sample:

```plain
AWS_ACCESS_KEY_ID="key"
AWS_SECRET_ACCESS_KEY="secret"
AWS_REGION="eu-central-1"
```

Run tests:

```sh
# check tests inside src/__tests__
npm run test
npm run test:coverage
```

Current code coverage:

```plain
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   93.54 |    68.42 |     100 |   93.33 |                   
 src               |     100 |      100 |     100 |     100 |                   
  types.ts         |     100 |      100 |     100 |     100 |                   
 src/secrets       |    92.3 |       60 |     100 |    92.3 |                   
  constants.ts     |     100 |      100 |     100 |     100 |                   
  factory.ts       |      90 |       60 |     100 |      90 | 20                
  index.ts         |     100 |      100 |     100 |     100 |                   
 src/secrets/kinds |   93.75 |    66.66 |     100 |   93.33 |                   
  aws.ts           |   93.75 |    66.66 |     100 |   93.33 | 28                
-------------------|---------|----------|---------|---------|-------------------
```

## USAGE

### requirements for usage

* Node v14+

### installation

```sh
npm i @xplora-uk/secrets
```

### configuration

```typescript
import { newSecretsReader } from '@xplora-uk/secrets';

// configure and load
const secretsReader = newSecretsReader({}); // defaults to aws
//const secretsReader = newSecretsReader({ kind: 'aws' });

// use
const secret = await secretsReader.readSecret({ secretId: process.env.APP_ID });
if (secret.error) console.error('failed to read secret', secret.error);

// merge with process.env if needed
const config = { ...process.env, ...secret.data };
```
