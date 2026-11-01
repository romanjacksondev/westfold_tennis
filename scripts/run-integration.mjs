import { randomUUID } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const root = process.cwd();
const container = process.env.TEST_POSTGRES_CONTAINER || 'docker-db-1';
const schema = `westfold_test_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const distDir = `.next-integration-${schema}`;
const tsconfigPath = `.tsconfig-integration-${schema}.json`;
const playwrightOutputDir = resolve(tmpdir(), `westfold-playwright-${schema}`);
const runE2E = process.argv.includes('--e2e');
let schemaCreated = false;
let ownsDistDir = false;
let ownsTsconfig = false;
let originalNextEnv;
let originalAgentRules;
let server;
let failure;

function run(command, args, env = process.env, capture = false) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    encoding: 'utf8',
    stdio: capture ? 'pipe' : 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || `${command} exited with status ${result.status}`);
  }
  return capture ? result.stdout.trim() : '';
}

function quoteIdentifier(identifier) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid PostgreSQL identifier: ${identifier}`);
  }
  return `"${identifier}"`;
}

function inspectPostgres() {
  const inspect = JSON.parse(run('docker', ['inspect', container], process.env, true))[0];
  const environment = Object.fromEntries(
    inspect.Config.Env.map((value) => {
      const separator = value.indexOf('=');
      return [value.slice(0, separator), value.slice(separator + 1)];
    }),
  );
  const mapping = inspect.NetworkSettings.Ports['5432/tcp']?.[0];
  const user = environment.POSTGRES_USER;
  const database = environment.POSTGRES_DB;
  const password = environment.POSTGRES_PASSWORD;

  if (!user || !database || !password || !mapping?.HostPort) {
    throw new Error(`Container ${container} must expose PostgreSQL credentials and port mapping.`);
  }
  if (inspect.State.Status !== 'running') throw new Error(`Container ${container} is not running.`);
  return { user, database, password, port: Number(mapping.HostPort) };
}

async function getFreePort() {
  const listener = createServer();
  await new Promise((resolveListen, reject) => {
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', resolveListen);
  });
  const address = listener.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a local port.');
  await new Promise((resolveClose, reject) =>
    listener.close((error) => (error ? reject(error) : resolveClose())),
  );
  return address.port;
}

async function waitForServer(url) {
  const deadline = Date.now() + 180_000;
  let lastError;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Next.js exited with status ${server.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch (error) {
      lastError = error;
    }
    await delay(500);
  }
  throw new Error(
    `Next.js did not become ready: ${lastError instanceof Error ? lastError.message : 'timeout'}`,
  );
}

async function stopServer() {
  if (!server || server.exitCode !== null) return;
  server.kill('SIGTERM');
  await Promise.race([
    new Promise((resolveExit) => server.once('exit', resolveExit)),
    delay(10_000).then(() => {
      if (server.exitCode === null) server.kill('SIGKILL');
    }),
  ]);
}

try {
  const postgres = inspectPostgres();
  const safeSchema = quoteIdentifier(schema);
  const safeOwner = quoteIdentifier(postgres.user);
  run('docker', [
    'exec',
    container,
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    postgres.user,
    '-d',
    postgres.database,
    '-c',
    `CREATE SCHEMA ${safeSchema} AUTHORIZATION ${safeOwner}`,
  ]);
  schemaCreated = true;

  const databaseUrl = new URL(
    `postgresql://${encodeURIComponent(postgres.user)}:${encodeURIComponent(postgres.password)}@127.0.0.1:${postgres.port}/${encodeURIComponent(postgres.database)}`,
  );
  databaseUrl.searchParams.set('schema', schema);
  if (
    databaseUrl.pathname !== `/${postgres.database}` ||
    databaseUrl.searchParams.get('schema') !== schema
  ) {
    throw new Error('Integration database URL did not resolve to the isolated test schema.');
  }
  const testEnv = {
    ...process.env,
    DATABASE_URL: databaseUrl.toString(),
    TEST_DATABASE_URL: databaseUrl.toString(),
    TEST_DATABASE_SCHEMA: schema,
    NEXTAUTH_SECRET: `integration-${randomUUID()}`,
    NEXTAUTH_URL: 'http://127.0.0.1',
    NEXT_DIST_DIR: distDir,
    NEXT_TSCONFIG_PATH: tsconfigPath,
    E2E_ADMIN_EMAIL: 'integration-admin@example.test',
    E2E_ADMIN_PASSWORD: 'westfold-e2e-password',
    PLAYWRIGHT_OUTPUT_DIR: playwrightOutputDir,
  };

  run(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], testEnv);
  run(resolve(root, 'node_modules/.bin/tsx'), ['prisma/seed.test.ts'], testEnv);

  if (existsSync(resolve(root, distDir)))
    throw new Error('Temporary Next.js output directory already exists.');
  if (existsSync(resolve(root, tsconfigPath)))
    throw new Error('Temporary TypeScript config already exists.');
  ownsDistDir = true;
  ownsTsconfig = true;
  originalNextEnv = readFileSync(resolve(root, 'next-env.d.ts'), 'utf8');
  originalAgentRules = readFileSync(resolve(root, 'AGENTS.md'), 'utf8');
  writeFileSync(resolve(root, tsconfigPath), JSON.stringify({ extends: './tsconfig.json' }));
  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  testEnv.NEXTAUTH_URL = baseUrl;
  server = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)],
    { cwd: root, env: testEnv, stdio: 'inherit' },
  );
  await waitForServer(`${baseUrl}/api/leaderboard`);
  testEnv.INTEGRATION_BASE_URL = baseUrl;

  run(process.execPath, ['--import', 'tsx', '--test', 'tests/integration/api.test.ts'], testEnv);
  if (runE2E) {
    run(
      process.execPath,
      [
        'node_modules/@playwright/test/cli.js',
        'test',
        '--config',
        'tests/e2e/playwright.config.ts',
      ],
      testEnv,
    );
  }
} catch (error) {
  failure = error;
} finally {
  try {
    await stopServer();
  } catch (error) {
    failure ??= error;
  }
  if (ownsDistDir) {
    try {
      rmSync(resolve(root, distDir), { recursive: true, force: true });
    } catch (error) {
      failure ??= error;
    }
    if (ownsTsconfig) {
      try {
        rmSync(resolve(root, tsconfigPath), { force: true });
      } catch (error) {
        failure ??= error;
      }
    }
    if (originalNextEnv) {
      try {
        const currentNextEnv = readFileSync(resolve(root, 'next-env.d.ts'), 'utf8');
        if (currentNextEnv.includes(distDir)) {
          writeFileSync(resolve(root, 'next-env.d.ts'), originalNextEnv);
        }
        if (originalAgentRules) {
          try {
            const currentAgentRules = readFileSync(resolve(root, 'AGENTS.md'), 'utf8');
            const generatedBlock =
              /<!-- BEGIN:nextjs-agent-rules -->[\s\S]*?<!-- END:nextjs-agent-rules -->/g;
            if (
              originalAgentRules.replace(generatedBlock, '') ===
              currentAgentRules.replace(generatedBlock, '')
            ) {
              writeFileSync(resolve(root, 'AGENTS.md'), originalAgentRules);
            }
          } catch (error) {
            failure ??= error;
          }
        }
      } catch (error) {
        failure ??= error;
      }
    }
  }
  if (runE2E) {
    try {
      rmSync(playwrightOutputDir, { recursive: true, force: true });
    } catch (error) {
      failure ??= error;
    }
  }
  if (schemaCreated) {
    try {
      const postgres = inspectPostgres();
      const safeSchema = quoteIdentifier(schema);
      run('docker', [
        'exec',
        container,
        'psql',
        '-v',
        'ON_ERROR_STOP=1',
        '-U',
        postgres.user,
        '-d',
        postgres.database,
        '-c',
        `DROP SCHEMA ${safeSchema} CASCADE`,
      ]);
    } catch (error) {
      failure ??= error;
    }
  }
}

if (failure) {
  console.error(failure);
  process.exitCode = 1;
}
