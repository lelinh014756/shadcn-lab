<!--
DOEL: Deployment & Rollback Guide

Mục đích:
- Hướng dẫn deployment từng bước, rollback procedures
- Pre-deploy checklist, verification, monitoring, escalation
- Living doc tại docs/deployment-guide.md hoặc one-off report

Sử dụng khi:
- Production deployments
- Release planning
- Incident response
- On-call runbooks
-->
---
# Mẫu Deployment / Rollback Guide. Dùng làm living doc tại docs/deployment-guide.md hoặc one-off report.
report_type: deployment-guide
generated_at: ""
source: ""
agent_or_skill: ""
---

# Deployment Guide: {systemName}

**Version:** {version} | **Last Updated:** {generated_at} | **Owner:** {owner}

---

## 1. Pre-deploy Checklist

- [ ] DB backup hoàn tất
- [ ] Migration status đã kiểm tra (backward compatible?)
- [ ] Feature flags configured
- [ ] Staging smoke test passed
- [ ] Rollback plan confirmed
- [ ] On-call engineer notified

## 2. Thứ tự deploy

{#deploySteps}
### Step {stepNumber}: {stepName}

**Target:** {target} | **Expected time:** {duration}

```bash
{command}
```

**Verify:** {verifyCommand}
{/deploySteps}

## 3. Database Migrations

{#migrations}
### {migrationName}

**Direction:** {direction} (forward / rollback)

```sql
{sqlCommand}
```

**Backward compatible:** {isBackwardCompatible}

**Data rollback:** {dataRollbackStrategy}
{/migrations}

## 4. Post-deploy Verification

{#verificationChecks}
- [ ] {checkDescription} — Command: `{command}`
{/verificationChecks}

**Monitoring metrics to watch (15 phút đầu):**
{#monitoringMetrics}
- {metricName}: expected {expectedValue}, alert if {alertCondition}
{/monitoringMetrics}

## 5. Rollback Procedure

**Trigger điều kiện rollback:** {rollbackTrigger}

{#rollbackSteps}
### Step {stepNumber}: {stepName}

```bash
{command}
```
{/rollbackSteps}

**Estimated rollback time:** {rollbackDuration}

## 6. Incident Escalation

| Tình huống | Hành động | Liên hệ |
|-----------|----------|---------|
{#escalationMatrix}
| {situation} | {action} | {contact} |
{/escalationMatrix}

## 7. Environment Variables

| Variable | Required | Mô tả |
|---------|----------|-------|
{#envVars}
| `{name}` | {required} | {description} |
{/envVars}

## 8. Known Issues / Gotchas

{#knownIssues}
- **{issue}:** {workaround}
{/knownIssues}
