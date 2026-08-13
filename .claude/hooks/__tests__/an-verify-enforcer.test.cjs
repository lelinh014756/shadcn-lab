#!/usr/bin/env node

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const HOOK_PATH = path.join(__dirname, '..', 'an-verify-enforcer.cjs');

function getSessionFile(sessionId) {
  return path.join(os.tmpdir(), `ck-session-${sessionId}.json`);
}

function writeSessionState(sessionId, state) {
  fs.writeFileSync(getSessionFile(sessionId), JSON.stringify(state, null, 2));
}

function cleanupSessionState(sessionId) {
  fs.rmSync(getSessionFile(sessionId), { force: true });
}

function runHook(inputData, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [HOOK_PATH], {
      cwd: process.cwd(),
      env: { ...process.env, ...(options.env || {}) }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });

    if (inputData !== null && inputData !== undefined) {
      proc.stdin.write(typeof inputData === 'string' ? inputData : JSON.stringify(inputData));
    }
    proc.stdin.end();

    proc.on('close', (code) => {
      let output = null;
      try { output = JSON.parse(stdout); } catch { }
      resolve({ exitCode: code, stdout, stderr, output });
    });

    proc.on('error', reject);
    setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error('Timeout'));
    }, 10000);
  });
}

describe('an-verify-enforcer.cjs', () => {
  it('blocks malformed TaskCompleted payload', async () => {
    const result = await runHook('{bad json');

    assert.strictEqual(result.exitCode, 2);
    assert.match(result.stderr, /Invalid TaskCompleted payload/i);
  });

  it('allows out-of-scope tasks without token', async () => {
    const result = await runHook({
      task_id: '1',
      task_subject: 'Update docs impact',
      task_description: 'Non workflow task'
    });

    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output, 'Should return JSON output');
  });

  it('does not infer workflow from incidental description text', async () => {
    const result = await runHook({
      task_id: '1b',
      task_subject: 'Xác thực runtime enforcement',
      task_description: 'Kiểm tra case bypass cho ship và stale token'
    });

    assert.strictEqual(result.exitCode, 0);
    assert.ok(result.output, 'Should return JSON output');
  });

  it('blocks in-scope task when token is missing', async () => {
    const sessionId = `verify-missing-${Date.now()}`;
    try {
      const result = await runHook({
        session_id: sessionId,
        task_id: '2',
        task_subject: 'cook finalize phase',
        task_description: 'Mark cook workflow task completed'
      });

      assert.strictEqual(result.exitCode, 2);
      assert.match(result.stderr, /requires a fresh \/an-verify decision/i);
    } finally {
      cleanupSessionState(sessionId);
    }
  });

  it('allows fresh pass token', async () => {
    const sessionId = `verify-pass-${Date.now()}`;
    try {
      writeSessionState(sessionId, {
        anVerifyGate: {
          decision: 'pass',
          workflow: 'cook',
          recordedAt: Date.now(),
          ttlMs: 15 * 60 * 1000,
          expiresAt: Date.now() + 15 * 60 * 1000
        }
      });

      const result = await runHook({
        session_id: sessionId,
        task_id: '3',
        task_subject: 'cook finalize phase',
        task_description: 'Mark cook workflow task completed'
      });

      assert.strictEqual(result.exitCode, 0);
      assert.match(result.output.hookSpecificOutput.additionalContext, /VERIFY_GATE_PASS/);
    } finally {
      cleanupSessionState(sessionId);
    }
  });

  it('blocks tokens without workflow scope', async () => {
    const sessionId = `verify-noscope-${Date.now()}`;
    try {
      writeSessionState(sessionId, {
        anVerifyGate: {
          decision: 'pass',
          recordedAt: Date.now(),
          ttlMs: 15 * 60 * 1000,
          expiresAt: Date.now() + 15 * 60 * 1000
        }
      });

      const result = await runHook({
        session_id: sessionId,
        task_id: '4',
        task_subject: 'cook finalize phase',
        task_description: 'Mark cook workflow task completed'
      });

      assert.strictEqual(result.exitCode, 2);
      assert.match(result.stderr, /does not match workflow/i);
    } finally {
      cleanupSessionState(sessionId);
    }
  });

  it('allows bypass for non-ship-ready tasks', async () => {
    const sessionId = `verify-bypass-${Date.now()}`;
    try {
      writeSessionState(sessionId, {
        anVerifyGate: {
          decision: 'bypass',
          workflow: 'ship',
          recordedAt: Date.now(),
          ttlMs: 15 * 60 * 1000,
          expiresAt: Date.now() + 15 * 60 * 1000
        }
      });

      const result = await runHook({
        session_id: sessionId,
        task_id: '4',
        task_subject: 'ship collect issue links',
        task_description: 'Non readiness step'
      });

      assert.strictEqual(result.exitCode, 0);
      assert.match(result.output.hookSpecificOutput.additionalContext, /VERIFY_GATE_BYPASS/);
    } finally {
      cleanupSessionState(sessionId);
    }
  });

  it('blocks bypass for ship-ready tasks', async () => {
    const sessionId = `verify-ship-${Date.now()}`;
    try {
      writeSessionState(sessionId, {
        anVerifyGate: {
          decision: 'bypass',
          workflow: 'ship',
          recordedAt: Date.now(),
          ttlMs: 15 * 60 * 1000,
          expiresAt: Date.now() + 15 * 60 * 1000
        }
      });

      const result = await runHook({
        session_id: sessionId,
        task_id: '5',
        task_subject: 'ship ready to ship',
        task_description: 'PR-ready claim'
      });

      assert.strictEqual(result.exitCode, 2);
      assert.match(result.stderr, /VERIFY_GATE_BYPASS is not sufficient for ship readiness tasks/i);
    } finally {
      cleanupSessionState(sessionId);
    }
  });

  it('blocks invalid decision tokens', async () => {
    const sessionId = `verify-invalid-${Date.now()}`;
    try {
      writeSessionState(sessionId, {
        anVerifyGate: {
          decision: 'unknown',
          workflow: 'cook',
          recordedAt: Date.now(),
          ttlMs: 15 * 60 * 1000,
          expiresAt: Date.now() + 15 * 60 * 1000
        }
      });

      const result = await runHook({
        session_id: sessionId,
        task_id: '5b',
        task_subject: 'cook finalize phase',
        task_description: 'Mark cook workflow task completed'
      });

      assert.strictEqual(result.exitCode, 2);
      assert.match(result.stderr, /decision is invalid/i);
    } finally {
      cleanupSessionState(sessionId);
    }
  });

  it('blocks stale tokens', async () => {
    const sessionId = `verify-stale-${Date.now()}`;
    try {
      writeSessionState(sessionId, {
        anVerifyGate: {
          decision: 'pass',
          workflow: 'an-fix',
          recordedAt: Date.now() - (20 * 60 * 1000),
          ttlMs: 15 * 60 * 1000,
          expiresAt: Date.now() - (5 * 60 * 1000)
        }
      });

      const result = await runHook({
        session_id: sessionId,
        task_id: '6',
        task_subject: 'an-fix finalize bug',
        task_description: 'Mark fix completed'
      });

      assert.strictEqual(result.exitCode, 2);
      assert.match(result.stderr, /token for workflow .* is stale/i);
    } finally {
      cleanupSessionState(sessionId);
    }
  });
});
