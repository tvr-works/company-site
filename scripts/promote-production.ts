import assert from 'node:assert/strict';

const repository = process.env.GITHUB_REPOSITORY;
const sha = process.env.GITHUB_SHA;
const token = process.env.GH_TOKEN;
assert.ok(repository && sha && token, 'GitHub repository, commit, and job token are required.');
assert.match(sha, /^[a-f0-9]{40}$/u, 'Expected a full commit SHA.');
const base = `${process.env.GITHUB_API_URL ?? 'https://api.github.com'}/repos/${repository}`;
const headers = {
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2026-03-10',
};
const response = await fetch(`${base}/git/ref/heads/main`, {
  headers,
  signal: AbortSignal.timeout(15_000),
});
assert.equal(response.status, 200, 'Could not read main.');
const main: unknown = await response.json();
assert.ok(
  main &&
    typeof main === 'object' &&
    'object' in main &&
    main.object &&
    typeof main.object === 'object' &&
    'sha' in main.object,
  'Invalid GitHub ref response.',
);
assert.equal(main.object.sha, sha, 'Main advanced; refusing to promote a superseded commit.');

// The protected production branch independently requires the successful validate
// check from GitHub Actions. Never force an update or create a bypass credential.
const promotion = await fetch(`${base}/git/refs/heads/production`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ sha, force: false }),
  signal: AbortSignal.timeout(15_000),
});
assert.equal(
  promotion.status,
  200,
  'Production promotion failed; inspect branch rules and CI status.',
);
console.log(`Promoted validated commit ${sha} to production. Cloudflare will build this revision.`);
