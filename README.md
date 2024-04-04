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
DB_HOST="${MYSQL_HOST}"
```

Run tests:

```sh
# check tests inside src/__tests__
npm run test
npm run test:coverage
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
