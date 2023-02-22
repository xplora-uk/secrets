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
    ✔ should read existing secret in AWS
    ✔ should read existing secret in AWS (175ms)
    ✔ should read existing secret in AWS - with region - not found (115ms)
    ✔ should read existing secret in env - invalid json (132ms)
    ✔ should read existing secret in env - not found
    ✔ should read existing secret in env - no update
    ✔ should read existing secret in env - update
    ✔ should fail to read invalid secret (85ms)
    ✔ should read existing secret in AWS - no update env (158ms)
    ✔ should read existing secret in AWS - update env (163ms)
    ✔ should read existing secret in AWS and update env (123ms)


  11 passing (967ms)

-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |    68.9 |    45.78 |   57.14 |   73.73 |                   
 src               |     100 |      100 |     100 |     100 |                   
  types.ts         |     100 |      100 |     100 |     100 |                   
 src/secrets       |   77.27 |       50 |      60 |   88.23 |                   
  constants.ts     |     100 |      100 |     100 |     100 |                   
  factory.ts       |   86.66 |       40 |     100 |   86.66 | 21-22             
  index.ts         |     100 |      100 |     100 |     100 |                   
  utils.ts         |   69.23 |    52.94 |      50 |    87.5 | 32-35             
 src/secrets/kinds |   61.42 |    42.37 |      50 |   63.33 |                   
  aws.ts           |   95.23 |    81.25 |     100 |     100 | 25-27,38          
  dotEnvFile.ts    |   18.75 |        0 |       0 |   21.42 | 8-29              
  jsonFile.ts      |   18.75 |        0 |       0 |   21.42 | 8-29              
  processEnv.ts    |     100 |       80 |     100 |     100 | 8,25              
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

// use with side-effect on process.env
const secret = await secretsReader.readSecret({ secretId: process.env.APP_ID, env: process.env, updateEnv: true });
if (secret.error) console.error('failed to read secret', secret.error);
// also, secret.data contains secret object
```
