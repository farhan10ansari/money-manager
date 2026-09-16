import { afterEach, expect, test } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const policyScript = resolve(import.meta.dir, '../scripts/check-version-bump.mjs');
const temporaryRepositories = [];

const run = (command, args, cwd) => spawnSync(command, args, {
  cwd,
  encoding: 'utf8',
});

const git = (repository, ...args) => {
  const result = run('git', args, repository);
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout);
  }
  return result.stdout.trim();
};

const writePackageVersion = (repository, version) => {
  writeFileSync(
    resolve(repository, 'package.json'),
    `${JSON.stringify({ name: 'fixture', version }, null, 2)}\n`,
  );
};

const createRepository = () => {
  const repository = mkdtempSync(resolve(tmpdir(), 'spendmate-version-policy-'));
  temporaryRepositories.push(repository);
  git(repository, 'init', '-b', 'main');
  git(repository, 'config', 'user.name', 'Version Policy Test');
  git(repository, 'config', 'user.email', 'version-policy@example.com');
  writePackageVersion(repository, '2.0.0');
  git(repository, 'add', 'package.json');
  git(repository, 'commit', '-m', 'initial version');
  return repository;
};

afterEach(() => {
  while (temporaryRepositories.length > 0) {
    rmSync(temporaryRepositories.pop(), { recursive: true, force: true });
  }
});

test('a direct commit on main requires a staged version greater than HEAD', () => {
  const repository = createRepository();

  writePackageVersion(repository, '2.0.1');
  git(repository, 'add', 'package.json');
  expect(run('node', [policyScript], repository).status).toBe(0);

  writePackageVersion(repository, '2.0.0');
  git(repository, 'add', 'package.json');
  const unchanged = run('node', [policyScript], repository);
  expect(unchanged.status).not.toBe(0);
  expect(unchanged.stderr).toContain('must be greater than 2.0.0');
});

test('local commits on non-main branches do not require a version bump', () => {
  const repository = createRepository();
  git(repository, 'checkout', '-b', 'feature/test');

  writeFileSync(resolve(repository, 'feature.txt'), 'feature work\n');
  git(repository, 'add', 'feature.txt');

  expect(run('node', [policyScript], repository).status).toBe(0);
});

test('a pull request into main requires a head version greater than the base version', () => {
  const repository = createRepository();
  const base = git(repository, 'rev-parse', 'HEAD');

  git(repository, 'checkout', '-b', 'feature/release');
  writePackageVersion(repository, '2.1.0');
  git(repository, 'add', 'package.json');
  git(repository, 'commit', '-m', 'bump version');
  const higherHead = git(repository, 'rev-parse', 'HEAD');

  expect(run('node', [policyScript, '--base', base, '--head', higherHead], repository).status).toBe(0);

  const unchanged = run('node', [policyScript, '--base', base, '--head', base], repository);
  expect(unchanged.status).not.toBe(0);
  expect(unchanged.stderr).toContain('must be greater than 2.0.0');
});

test('invalid package versions are rejected instead of compared loosely', () => {
  const repository = createRepository();

  writePackageVersion(repository, '2.0');
  git(repository, 'add', 'package.json');
  const result = run('node', [policyScript], repository);

  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain('valid x.y.z version');
});
