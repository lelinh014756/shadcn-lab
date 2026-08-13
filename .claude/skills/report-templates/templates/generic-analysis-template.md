<!--
DOEL: Generic Analysis Template

Mục đích:
- Template tổng quát cho các báo cáo phân tích (security, performance, dependency, v.v.)
- Có thể tùy chỉnh theo topic cụ thể
- Lưu trữ tại reports/research/analysis-{topic}-{date}.md

Sử dụng khi:
- Security analysis
- Performance profiling
- Dependency audits
- Code quality assessments
-->
---
report_type: "{topic}"
generated_at: ""
source: ""
agent_or_skill: ""
---

# {title}

## Context
{context}

## Scope
{scope}

## Key Findings
{#findings}
- {finding}
{/findings}

## Analysis

### Current State
{currentState}

### Gap Analysis
{gapAnalysis}

### Recommendations
{#recommendations}
- {recommendation}
{/recommendations}

## Dependencies
{#dependencies}
- {dependency}
{/dependencies}

## Open Questions
{#questions}
- {question}
{/questions}

## Evidence

| Finding | File | Lines | Snippet ref | Confidence |
|---------|------|-------|-------------|------------|
{#evidence}
| {findingRef} | {filePath} | {lineRange} | {snippetRef} | {confidence} |
{/evidence}
