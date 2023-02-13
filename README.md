# secrets

use AWS SDK and read settings from Secrets Manager

It covers two scenarios:

A:

The secret `my_app` is already loaded into `process.env` e.g. in an AWS ECS container.
`process.env.my_app` is `{ "DB_PASS": "secretPassword" }`

Then, `result.data` is an object based on `JSON.parse(process.env.my_app)`.

B:

The secret is not in `process.env` but only in AWS Secrets Manager.

Then, `result.data` is an object based on `JSON.parse(secret)` the secret found on AWS.

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
my_app='{ "PASSWORD": "pass1234" }'
```

Run tests:

```sh
# check tests inside src/__tests__
npm run test
npm run test:coverage
```

Current code coverage:

```plain
  secrets reader for AWS
    ✔ should read existing secret in AWS (222ms)
    ✔ should read existing secret in env
    ✔ should fail to read invalid secret (149ms)


  3 passing (376ms)

-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   94.28 |    74.07 |     100 |   94.11 |                   
 src               |     100 |      100 |     100 |     100 |                   
  types.ts         |     100 |      100 |     100 |     100 |                   
 src/secrets       |    92.3 |       60 |     100 |    92.3 |                   
  constants.ts     |     100 |      100 |     100 |     100 |                   
  factory.ts       |      90 |       60 |     100 |      90 | 20                
  index.ts         |     100 |      100 |     100 |     100 |                   
 src/secrets/kinds |      95 |       75 |     100 |   94.73 |                   
  aws.ts           |      95 |       75 |     100 |   94.73 | 38                
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
