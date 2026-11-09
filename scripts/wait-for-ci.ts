import assert from 'node:assert/strict';
import { setTimeout } from 'node:timers/promises';

const sha = process.env.CF_PAGES_COMMIT_SHA;
const branch = process.env.CF_PAGES_BRANCH;
assert.ok(sha && branch, 'Cloudflare commit and branch context are required; refusing deployment.');
assert.match(sha, /^[a-f0-9]{40}$/u, 'Expected a full Cloudflare commit SHA.');

const repository = 'tvr-works/company-site';
const query = new URLSearchParams({ head_sha: sha, branch, event: 'push', per_page: '10' });
const endpoint = `https://api.github.com/repos/${repository}/actions/workflows/ci.yml/runs?${query}`;
const deadline = Date.now() + 8 * 60_000;

type Run = {
  id: number;
  head_sha: string;
  head_branch: string;
  event: string;
  status: string;
  conclusion: string | null;
};

function isRun(value: unknown): value is Run {
  return (
    !!value &&
    typeof value === 'object' &&
    'id' in value &&
    typeof value.id === 'number' &&
    'head_sha' in value &&
    typeof value.head_sha === 'string' &&
    'head_branch' in value &&
    typeof value.head_branch === 'string' &&
    'event' in value &&
    typeof value.event === 'string' &&
    'status' in value &&
    typeof value.status === 'string' &&
    'conclusion' in value &&
    (typeof value.conclusion === 'string' || value.conclusion === null)
  );
}

async function waitForCI(attempt = 0): Promise<void> {
  if (Date.now() >= deadline)
    throw new Error(`Timed out waiting for CI for ${branch}@${sha}. Nothing will be published.`);
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'TVR-Works-Pages-CI-Gate' },
    signal: AbortSignal.timeout(15_000),
  });
  if (response.status === 403 || response.status === 429)
    throw new Error(
      'GitHub public API access was denied or rate-limited. Retry this Cloudflare build after CI passes; deployment remains blocked.',
    );
  assert.equal(
    response.status,
    200,
    `GitHub CI lookup failed (${response.status}); refusing deployment.`,
  );
  const payload: unknown = await response.json();
  assert.ok(
    payload &&
      typeof payload === 'object' &&
      'workflow_runs' in payload &&
      Array.isArray(payload.workflow_runs),
    'Invalid GitHub workflow response; refusing deployment.',
  );
  const run = payload.workflow_runs
    .filter(isRun)
    .find(
      (entry) => entry.head_sha === sha && entry.head_branch === branch && entry.event === 'push',
    );
  if (run?.status === 'completed') {
    assert.equal(
      run.conclusion,
      'success',
      `CI run ${run.id} concluded ${run.conclusion}; refusing deployment.`,
    );
    console.log(
      `CI passed for exact commit ${sha} on ${branch}: https://github.com/${repository}/actions/runs/${run.id}`,
    );
    return;
  }
  console.log(
    `Waiting for push CI for ${branch}@${sha}${run ? ` (run ${run.id}: ${run.status})` : ' (run not created yet)'}.`,
  );
  await setTimeout(Math.min(30_000, 10_000 * (attempt + 1)));
  return waitForCI(attempt + 1);
}

await waitForCI();
