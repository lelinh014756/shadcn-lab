<!--
DOEL: Generic Report Template

Mục đích:
- Template tổng quát cho các báo cáo one-off (audits, assessments, reviews)
- Phù hợp cho reports cần findings, analysis, recommendations, evidence
- Lưu trữ tại reports/research/{topic}-{date}.md

Sử dụng khi:
- Project audits
- Gap analysis
- Risk assessments
- Compliance reviews
-->
---
report_type: "{topic}"
generated_at: ""
source: ""
agent_or_skill: ""
---

# {title}

**Date:** {generated_at}
**Scope:** {scope}

## Summary
{summary}

## Findings

{#findings}

### {findingTitle}
- **Status:** {status}
- **Severity:** {severity}
- **Details:** {details}

{/findings}

## Recommendations
{#recommendations}
- {recommendation}
{/recommendations}

## Risk Assessment
- **Overall Risk:** {overallRisk}
- **Blocking Issues:** {blockingIssues}

## Next Steps
{#nextSteps}
- {step}
{/nextSteps}

## Evidence

| Finding | File | Lines | Snippet ref | Confidence |
|---------|------|-------|-------------|------------|
{#evidence}
| {findingRef} | {filePath} | {lineRange} | {snippetRef} | {confidence} |
{/evidence}
