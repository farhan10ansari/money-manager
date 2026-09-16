#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const runGit = (...args) => {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || `git ${args.join(' ')} failed`);
  }
  return result.stdout.trim();
};

const parseVersion = (version, label) => {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(version);
  if (!match) {
    throw new Error(`${label} must contain a valid x.y.z version; received ${JSON.stringify(version)}.`);
  }

  const parts = match.slice(1).map(Number);
  if (parts.some((part) => !Number.isSafeInteger(part))) {
    throw new Error(`${label} must contain a valid x.y.z version; received ${JSON.stringify(version)}.`);
  }
  return parts;
};

const isGreaterVersion = (candidate, current) => {
  const candidateParts = parseVersion(candidate, 'Candidate package.json');
  const currentParts = parseVersion(current, 'Base package.json');

  for (let index = 0; index < candidateParts.length; index += 1) {
    if (candidateParts[index] !== currentParts[index]) {
      return candidateParts[index] > currentParts[index];
    }
  }
  return false;
};

const readVersion = (ref, label) => {
  let packageJson;
  try {
    packageJson = JSON.parse(runGit('show', `${ref}:package.json`));
  } catch (error) {
    throw new Error(`Could not read package.json from ${label}: ${error.message}`);
  }

  parseVersion(packageJson.version, `${label} package.json`);
  return packageJson.version;
};

const requireGreaterVersion = (baseVersion, candidateVersion, context) => {
  if (!isGreaterVersion(candidateVersion, baseVersion)) {
    throw new Error(
      `${context} version ${candidateVersion} must be greater than ${baseVersion}. ` +
      'Bump the version in package.json.',
    );
  }
};

const parseArguments = (args) => {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--base' || argument === '--head') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`${argument} requires a Git revision.`);
      }
      options[argument.slice(2)] = value;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return options;
};

const checkPullRequest = (base, head) => {
  const baseVersion = readVersion(base, 'base revision');
  const headVersion = readVersion(head, 'pull request head');
  requireGreaterVersion(baseVersion, headVersion, 'Pull request package.json');
  console.log(`Version policy passed: ${baseVersion} -> ${headVersion}.`);
};

const checkLocalCommit = () => {
  const branch = runGit('symbolic-ref', '--quiet', '--short', 'HEAD');
  if (branch !== 'main') {
    console.log(`Version policy skipped on ${branch}; it is enforced when merging into main.`);
    return;
  }

  const baseVersion = readVersion('HEAD', 'HEAD');
  const stagedVersion = readVersion('', 'the staged index');
  requireGreaterVersion(baseVersion, stagedVersion, 'Staged package.json');
  console.log(`Version policy passed: ${baseVersion} -> ${stagedVersion}.`);
};

try {
  const { base, head } = parseArguments(process.argv.slice(2));
  if (base || head) {
    if (!base || !head) {
      throw new Error('Both --base and --head are required for a pull-request check.');
    }
    checkPullRequest(base, head);
  } else {
    checkLocalCommit();
  }
} catch (error) {
  console.error(`Version policy failed: ${error.message}`);
  process.exitCode = 1;
}
