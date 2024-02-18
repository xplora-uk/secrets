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

* Node v18.x

### install, build, configure, test

```sh
npm i
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
    ✔ should read all secrets with default settings (460ms)

  secrets reader for AWS
    ✔ should read existing secret in AWS
    ✔ should read existing secret in AWS (232ms)
    ✔ should read existing secret in AWS - with region - not found (98ms)
    ✔ should read existing secret in env - invalid json (135ms)
    ✔ should read existing secret in env - not found
    ✔ should read existing secret in env - no update
    ✔ should read existing secret in env - update
    ✔ should fail to read invalid secret (255ms)
    ✔ should read existing secret in AWS - no update env (121ms)
    ✔ should read existing secret in AWS - update env (186ms)
    ✔ should read existing secret in AWS and update env (388ms)


  12 passing (2s)

-------------------|---------|----------|---------|---------|----------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s    
-------------------|---------|----------|---------|---------|----------------------
All files          |    75.9 |    50.81 |   73.33 |   83.08 |                      
 src               |     100 |      100 |     100 |     100 |                      
  types.ts         |     100 |      100 |     100 |     100 |                      
 src/secrets       |    77.9 |    52.54 |   66.66 |   85.71 |                      
  batch.ts         |   76.74 |    54.28 |     100 |   81.08 | 28,40,46,52,58,69-72 
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

* Node v18.x

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

### batch reader

Sample:

```ts
const env: IEnvSettings = {
  ...process.env, // use a copy of process.env, if you do not change it!
  PROGRAM_NAME: 'my-test-app',
};
const { errors } = await batchReadSecrets({ env }); // note side-effect on env
```

1. Load `_defaults.env` file.
2. Load `_sharedSecrets.json`, if it was injected by CI/CD script.
3. Load `shared` secret from AWS, if it exists.
4. Load `_secrets.json` file, if it was injected by CI/CD script.
5. Load `{env.PROGRAM_NAME}` secret from AWS, if it exists.
6. Load `.env` file, if it exists. Developers can copy default settings and override.
7. Expand variables using [dotenv-expand](https://www.npmjs.com/package/dotenv).

In each step, we will merge settings found into `env` object.
