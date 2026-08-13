'use strict';

const ENFORCED_WORKFLOWS = new Set(['an-fix', 'cook', 'code-review', 'ship']);
const DEFAULT_VERIFY_TTL_MS = 15 * 60 * 1000;
const MAX_VERIFY_TTL_MS = 30 * 60 * 1000;

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeWorkflow(value) {
  const workflow = normalizeText(value);
  return ENFORCED_WORKFLOWS.has(workflow) ? workflow : null;
}

function matchWorkflowText(text) {
  const normalized = normalizeText(text);
  if (!normalized) return null;

  const patterns = [
    ['an-fix', /\ban[-\s]?fix\b/],
    ['code-review', /\bcode[-\s]?review\b/],
    ['cook', /\bcook\b/],
    ['ship', /\bship\b|\bready[-\s]+to[-\s]+ship\b|\bship[-\s]?ready\b|\bpr[-\s]?ready\b|\bcommit[-\s]?ready\b/]
  ];

  for (const [workflow, pattern] of patterns) {
    if (pattern.test(normalized)) return workflow;
  }

  return null;
}

function detectWorkflowFromText(taskSubject, taskDescription) {
  const subjectWorkflow = matchWorkflowText(taskSubject);
  if (subjectWorkflow) return subjectWorkflow;

  const description = normalizeText(taskDescription);
  if (!description) return null;

  const explicitDescriptionPrefixes = [
    /^workflow\s*[:=-]\s*/,
    /^task workflow\s*[:=-]\s*/,
    /^skill\s*[:=-]\s*/
  ];

  for (const prefix of explicitDescriptionPrefixes) {
    if (prefix.test(description)) {
      return matchWorkflowText(description.replace(prefix, ''));
    }
  }

  return null;
}

function isShipReadyTask(taskSubject, taskDescription) {
  const text = `${normalizeText(taskSubject)}\n${normalizeText(taskDescription)}`;
  return /\bready[-\s]+to[-\s]+ship\b|\bship[-\s]?ready\b|\bpr[-\s]?ready\b|\bcommit[-\s]?ready\b|\bready\s+for\s+pr\b|\bready\s+for\s+commit\b/.test(text);
}

function getVerifyToken(sessionState) {
  if (!sessionState || typeof sessionState !== 'object') return null;
  const token = sessionState.anVerifyGate || sessionState.verifyGate;
  return token && typeof token === 'object' ? token : null;
}

function hasFreshToken(token, now = Date.now()) {
  if (!token || typeof token !== 'object') return false;
  const recordedAt = Number(token.recordedAt);
  const expiresAt = Number(token.expiresAt);
  const ttlMs = Number(token.ttlMs) || DEFAULT_VERIFY_TTL_MS;

  if (Number.isFinite(expiresAt)) {
    return expiresAt > now;
  }

  if (!Number.isFinite(recordedAt)) return false;
  return recordedAt + ttlMs > now;
}

function buildBlockMessage(workflow, reason) {
  const prefix = 'Verification gate blocked task completion.';
  switch (reason) {
    case 'missing-token':
      return `${prefix} Workflow \"${workflow}\" requires a fresh /an-verify decision before marking the task completed.`;
    case 'stale-token':
      return `${prefix} The /an-verify token for workflow \"${workflow}\" is stale. Re-run /an-verify and then complete the task again.`;
    case 'scope-mismatch':
      return `${prefix} The stored /an-verify token does not match workflow \"${workflow}\". Re-run /an-verify in the current workflow context.`;
    case 'bypass-ship-ready':
      return `${prefix} VERIFY_GATE_BYPASS is not sufficient for ship readiness tasks. Run /an-verify and get VERIFY_GATE_PASS.`;
    case 'missing-runtime-evidence':
      return `${prefix} Workflow \"${workflow}\" needs runtime UI/browser evidence for VERIFY_GATE_PASS. Re-run /an-verify with runtime evidence or record an explicit bypass/fail decision.`;
    case 'invalid-decision':
      return `${prefix} The stored /an-verify decision is invalid. Re-run /an-verify and record a fresh decision.`;
    default:
      return `${prefix} Re-run /an-verify before completing this task.`;
  }
}

function detectWorkflowFromPayload(payload = {}) {
  const explicitCandidates = [
    payload.workflow,
    payload.task_workflow,
    payload.taskWorkflow,
    payload.task_metadata?.workflow,
    payload.taskMetadata?.workflow,
    payload.metadata?.workflow
  ];

  for (const candidate of explicitCandidates) {
    const workflow = normalizeWorkflow(candidate);
    if (workflow) return workflow;
  }

  return detectWorkflowFromText(payload.taskSubject, payload.taskDescription);
}

function requiresRuntimeUiEvidence(taskSubject, taskDescription, token = {}) {
  const text = [
    taskSubject,
    taskDescription,
    token.claim,
    token.evidence,
    token.targetUrl,
    token.evidenceType,
  ].map((value) => String(value || '').trim().toLowerCase()).join('\n');

  if (!text) return false;

  return /\b(ui|browser|chrome|devtools|frontend|dom|screenshot|snapshot|console|network|runtime|page|route|url|click|interaction|render)\b/.test(text);
}

function hasRuntimeUiPass(token = {}) {
  const evidenceType = normalizeText(token.evidenceType);
  const runtimeHealth = normalizeText(token.runtimeHealth);
  return (evidenceType === 'runtime-ui' || evidenceType === 'mixed') && runtimeHealth === 'pass';
}

function evaluateVerifyCompletion({ taskSubject, taskDescription, sessionState, payload = {}, now = Date.now() } = {}) {
  const token = getVerifyToken(sessionState);
  const tokenWorkflow = normalizeWorkflow(token?.workflow);
  const taskWorkflow = detectWorkflowFromPayload({
    ...payload,
    taskSubject,
    taskDescription
  });
  const workflow = taskWorkflow;

  if (!workflow) {
    return {
      enforced: false,
      allowed: true,
      reason: 'out-of-scope',
      additionalContext: ''
    };
  }

  if (!token) {
    return {
      enforced: true,
      allowed: false,
      workflow,
      reason: 'missing-token',
      blockMessage: buildBlockMessage(workflow, 'missing-token')
    };
  }

  const decision = normalizeText(token.decision);
  if (!tokenWorkflow) {
    return {
      enforced: true,
      allowed: false,
      workflow,
      reason: 'scope-mismatch',
      blockMessage: buildBlockMessage(workflow, 'scope-mismatch')
    };
  }

  if (tokenWorkflow !== taskWorkflow) {
    return {
      enforced: true,
      allowed: false,
      workflow,
      reason: 'scope-mismatch',
      blockMessage: buildBlockMessage(workflow, 'scope-mismatch')
    };
  }

  if (!hasFreshToken(token, now)) {
    return {
      enforced: true,
      allowed: false,
      workflow,
      reason: 'stale-token',
      blockMessage: buildBlockMessage(workflow, 'stale-token')
    };
  }

  if (decision === 'pass') {
    if (requiresRuntimeUiEvidence(taskSubject, taskDescription, token) && !hasRuntimeUiPass(token)) {
      return {
        enforced: true,
        allowed: false,
        workflow,
        reason: 'missing-runtime-evidence',
        blockMessage: buildBlockMessage(workflow, 'missing-runtime-evidence')
      };
    }

    return {
      enforced: true,
      allowed: true,
      workflow,
      reason: 'pass',
      additionalContext: `Verification gate: workflow ${workflow} allowed by fresh VERIFY_GATE_PASS.`
    };
  }

  if (decision === 'bypass') {
    if (workflow === 'ship' && isShipReadyTask(taskSubject, taskDescription)) {
      return {
        enforced: true,
        allowed: false,
        workflow,
        reason: 'bypass-ship-ready',
        blockMessage: buildBlockMessage(workflow, 'bypass-ship-ready')
      };
    }

    return {
      enforced: true,
      allowed: true,
      workflow,
      reason: 'bypass',
      additionalContext: `Verification gate: workflow ${workflow} allowed by explicit VERIFY_GATE_BYPASS.`
    };
  }

  return {
    enforced: true,
    allowed: false,
    workflow,
    reason: 'invalid-decision',
    blockMessage: buildBlockMessage(workflow, 'invalid-decision')
  };
}

module.exports = {
  ENFORCED_WORKFLOWS,
  DEFAULT_VERIFY_TTL_MS,
  MAX_VERIFY_TTL_MS,
  normalizeWorkflow,
  detectWorkflowFromText,
  detectWorkflowFromPayload,
  isShipReadyTask,
  getVerifyToken,
  hasFreshToken,
  evaluateVerifyCompletion,
  buildBlockMessage,
  requiresRuntimeUiEvidence,
  hasRuntimeUiPass,
};
