#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const git = (...args) => spawnSync('git', args, { encoding: 'utf8' });
const repository = git('rev-parse', '--is-inside-work-tree');

if (repository.status !== 0 || repository.stdout.trim() !== 'true') {
  console.log('Skipping Git hook setup because this is not a Git working tree.');
  process.exit(0);
}

const configuredPath = git('config', '--local', '--get', 'core.hooksPath');
const currentPath = configuredPath.status === 0 ? configuredPath.stdout.trim() : '';

if (currentPath && currentPath !== '.githooks') {
  console.warn(
    `Git hooks were not changed because core.hooksPath is already set to ${JSON.stringify(currentPath)}.`,
  );
  process.exit(0);
}

const configured = git('config', '--local', 'core.hooksPath', '.githooks');
if (configured.status !== 0) {
  console.error(configured.stderr.trim() || 'Could not configure the Git hooks path.');
  process.exit(1);
}

console.log('Money Manager Git hooks are active.');
