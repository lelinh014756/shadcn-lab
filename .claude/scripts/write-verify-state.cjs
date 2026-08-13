#!/usr/bin/env node
'use strict';

const { readSessionState, writeSessionState } = require('../hooks/lib/ck-config-utils.cjs');
const { DEFAULT_VERIFY_TTL_MS, MAX_VERIFY_TTL_MS, ENFORCED_WORKFLOWS, normalizeWorkflow } = require('../hooks/lib/an-verify-policy.cjs');

function readArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith('--')) continue;
    const key = current.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function usage() {
  return [
    'Usage: rtk node .claude/scripts/write-verify-state.cjs --decision <pass|bypass|fail> [--workflow <an-fix|cook|code-review|ship>] [--claim <text>] [--evidence <text>] [--evidence-type <static|runtime-ui|mixed>] [--runtime-health <pass|fail|unknown>] [--target-url <url>] [--ttl-minutes <number>] [--session-id <id>]',
    'Example: rtk node .claude/scripts/write-verify-state.cjs --decision pass --workflow cook --claim "phase complete" --evidence-type mixed --runtime-health pass'
  ].join('\n');
}

function main() {
  const args = readArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(`${usage()}\n`);
    process.exit(0);
  }

  const sessionId = args['session-id'] || process.env.CK_SESSION_ID;
  const decision = String(args.decision || '').trim().toLowerCase();
  const workflow = args.workflow ? normalizeWorkflow(args.workflow) : null;
  const claim = String(args.claim || '').trim();
  const evidence = String(args.evidence || '').trim();
  const evidenceType = String(args['evidence-type'] || '').trim().toLowerCase();
  const runtimeHealth = String(args['runtime-health'] || '').trim().toLowerCase();
  const targetUrl = String(args['target-url'] || '').trim();
  const ttlMinutes = Number(args['ttl-minutes']);
  const requestedTtlMs = Number.isFinite(ttlMinutes) && ttlMinutes > 0 ? ttlMinutes * 60 * 1000 : DEFAULT_VERIFY_TTL_MS;
  const ttlMs = Math.min(requestedTtlMs, MAX_VERIFY_TTL_MS);

  if (!sessionId) {
    process.stderr.write('Missing session id. Set CK_SESSION_ID or pass --session-id.\n');
    process.exit(1);
  }

  if (!['pass', 'bypass', 'fail'].includes(decision)) {
    process.stderr.write('Invalid --decision. Use pass, bypass, or fail.\n');
    process.exit(1);
  }

  if (!workflow) {
    process.stderr.write(`Missing or invalid --workflow. Allowed: ${Array.from(ENFORCED_WORKFLOWS).join(', ')}.\n`);
    process.exit(1);
  }

  if (evidenceType && !['static', 'runtime-ui', 'mixed'].includes(evidenceType)) {
    process.stderr.write('Invalid --evidence-type. Use static, runtime-ui, or mixed.\n');
    process.exit(1);
  }

  if (runtimeHealth && !['pass', 'fail', 'unknown'].includes(runtimeHealth)) {
    process.stderr.write('Invalid --runtime-health. Use pass, fail, or unknown.\n');
    process.exit(1);
  }

  const now = Date.now();
  const currentState = readSessionState(sessionId) || {};
  const nextState = {
    ...currentState,
    anVerifyGate: {
      version: 1,
      source: 'an-verify',
      decision,
      workflow,
      claim,
      evidence,
      evidenceType: evidenceType || null,
      runtimeHealth: runtimeHealth || null,
      targetUrl: targetUrl || null,
      recordedAt: now,
      ttlMs,
      expiresAt: now + ttlMs
    }
  };

  const success = writeSessionState(sessionId, nextState);
  if (!success) {
    process.stderr.write('Failed to persist verify state.\n');
    process.exit(1);
  }

  process.stdout.write(JSON.stringify({
    ok: true,
    decision,
    workflow,
    evidenceType: nextState.anVerifyGate.evidenceType,
    runtimeHealth: nextState.anVerifyGate.runtimeHealth,
    targetUrl: nextState.anVerifyGate.targetUrl,
    expiresAt: nextState.anVerifyGate.expiresAt
  }));
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
