#!/usr/bin/env node

try {
  const fs = require('fs');
  const { isHookEnabled, readSessionState } = require('./lib/ck-config-utils.cjs');
  const { detectWorkflowFromPayload, evaluateVerifyCompletion } = require('./lib/an-verify-policy.cjs');

  if (!isHookEnabled('an-verify-enforcer')) {
    process.exit(0);
  }

  function emitContext(additionalContext = '') {
    const output = {
      hookSpecificOutput: {
        hookEventName: 'TaskCompleted',
        additionalContext
      }
    };
    process.stdout.write(JSON.stringify(output));
  }

  function failClosed(message) {
    process.stderr.write(`${message}\n`);
    process.exit(2);
  }

  function main() {
    const stdin = fs.readFileSync(0, 'utf-8').trim();
    if (!stdin) {
      emitContext('');
      process.exit(0);
    }

    let payload;
    try {
      payload = JSON.parse(stdin);
    } catch {
      failClosed('Verification gate blocked task completion. Invalid TaskCompleted payload. Re-run the task completion after fixing hook input.');
    }

    const workflow = detectWorkflowFromPayload({
      ...payload,
      taskSubject: payload.task_subject,
      taskDescription: payload.task_description
    });

    try {
      const sessionId = payload.session_id || process.env.CK_SESSION_ID || null;
      const sessionState = readSessionState(sessionId) || null;

      const result = evaluateVerifyCompletion({
        taskSubject: payload.task_subject,
        taskDescription: payload.task_description,
        sessionState,
        payload
      });

      if (!result.enforced || result.allowed) {
        emitContext(result.additionalContext || '');
        process.exit(0);
      }

      failClosed(result.blockMessage);
    } catch (error) {
      if (workflow) {
        failClosed(`Verification gate blocked task completion. Runtime verifier failed for workflow \"${workflow}\": ${error.message}`);
      }

      if (process.env.CK_DEBUG) {
        process.stderr.write(`[an-verify-enforcer] ${error.message}\n`);
      }
      process.exit(0);
    }
  }

  main();
} catch (error) {
  if (process.env.CK_DEBUG) {
    process.stderr.write(`[an-verify-enforcer] ${error.message}\n`);
  }
  process.exit(0);
}
