import { expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const configPath = resolve(import.meta.dir, '../app.config.js');
const packageVersion = require('../package.json').version;

test('Expo app version is always derived from package.json', () => {
  expect(existsSync(configPath)).toBe(true);

  const configureApp = require(configPath);
  const resolvedConfig = configureApp({ config: { version: '0.0.0-test' } });

  expect(resolvedConfig.version).toBe(packageVersion);
});
