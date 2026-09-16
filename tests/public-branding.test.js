import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dir, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const repositoryUrl = 'https://github.com/farhan10ansari/money-manager';
const privacyPolicyUrl = 'https://farhan10ansari.github.io/money-manager/privacy-policy';

test('public app links follow the renamed money-manager repository', () => {
  const easConfig = JSON.parse(read('eas.json'));

  for (const profile of ['development', 'preview', 'production']) {
    expect(easConfig.build[profile].env.EXPO_PUBLIC_PRIVACY_POLICY).toBe(privacyPolicyUrl);
  }

  expect(read('app/menu/about.tsx')).toContain(repositoryUrl);
  expect(read('README.md')).toContain(privacyPolicyUrl);
  expect(read('README.md')).toContain(`${repositoryUrl}/issues`);
  expect(read('CONTRIBUTING.md')).toContain(`${repositoryUrl}.git`);
  expect(read('docs/index.html')).toContain(repositoryUrl);
});

test('privacy policy matches the current app identity and local-only data behavior', () => {
  const policy = read('docs/privacy-policy.md');

  expect(policy).toContain('Money Manager: Expense Tracker');
  expect(policy).toContain(repositoryUrl);
  expect(policy).toContain('does not display advertisements');
  expect(policy).toContain('do not collect or transmit');
  expect(policy).not.toContain('may collect basic non-personal device information');
  expect(policy).not.toContain('Local encryption');
});

test('onboarding introduces Money Manager instead of the retired app name', () => {
  expect(read('features/Onboarding/OnboardingItem.tsx')).toContain('MEET MONEY MANAGER');
  expect(read('features/Onboarding/OnboardingItem.tsx')).not.toContain('MEET SPENDMATE');
});
