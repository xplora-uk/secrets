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
  secrets reader in batch
    ✔ should read all secrets with default settings (494ms)

  secrets reader for AWS
    ✔ should read existing secret in AWS
    ✔ should read existing secret in AWS (130ms)
    ✔ should read existing secret in AWS - with region - not found (287ms)
    ✔ should read existing secret in env - invalid json (100ms)
    ✔ should read existing secret in env - not found
    ✔ should read existing secret in env - no update
    ✔ should read existing secret in env - update
    ✔ should fail to read invalid secret (82ms)
    ✔ should read existing secret in AWS - no update env (222ms)
    ✔ should read existing secret in AWS - update env (196ms)
    ✔ should read existing secret in AWS and update env (132ms)


  12 passing (2s)

-------------------|---------|----------|---------|---------|----------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s    
-------------------|---------|----------|---------|---------|----------------------
All files          |    75.9 |    50.81 |   73.33 |   83.08 |                      
 src               |     100 |      100 |     100 |     100 |                      
  types.ts         |     100 |      100 |     100 |     100 |                      
 src/secrets       |    77.9 |    52.54 |   66.66 |   85.71 |                      
  batch.ts         |   76.74 |    54.28 |     100 |   81.08 | 29,38,44,50,56,67-70 
  constants.ts     |     100 |      100 |     100 |     100 |                      
  factory.ts       |   93.33 |       60 |     100 |   93.33 | 21                   
  utils.ts         |   69.23 |    47.36 |      50 |    87.5 | 32-35                
 src/secrets/kinds |      72 |    47.54 |      75 |   78.68 |                      
  aws.ts           |   95.23 |    78.57 |     100 |     100 | 25-27,38             
  dotEnvFile.ts    |   14.28 |        0 |       0 |      20 | 8-30                 
  jsonFile.ts      |    87.5 |    46.15 |     100 |   92.85 | 23                   
  processEnv.ts    |     100 |       80 |     100 |     100 | 8,25                 
-------------------|---------|----------|---------|---------|----------------------
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
