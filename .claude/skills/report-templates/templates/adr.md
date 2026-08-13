<!--
DOEL: Architecture Decision Record (ADR)

Mục đích:
- Ghi lại quyết định kiến trúc quan trọng (context, decision, rationale, consequences)
- Living doc - track lifecycle: proposed → accepted → deprecated → superseded
- Lưu trữ tại docs/adr/ADR-XXXX-{slug}.md

Sử dụng khi:
- Ra quyết định kiến trúc quan trọng
- Trade-off analysis giữa các giải pháp
- Document rationale cho future reference
- Revisit decisions khi điều kiện thay đổi
-->
---
# ADR — Architecture Decision Record. Living doc, lưu tại docs/adr/ADR-XXXX-{slug}.md
report_type: adr
generated_at: ""
source: ""
agent_or_skill: ""
status: "proposed"   # proposed | accepted | deprecated | superseded
---

# ADR-{XXXX}: {title}

**Date:** {generated_at} | **Status:** {status} | **Deciders:** {deciders}

---

## Bối cảnh

{context}

*Ràng buộc:* {constraints}

## Quyết định

{decision}

## Các phương án đã cân nhắc

| Phương án | Pros | Cons |
|----------|------|------|
{#options}
| **{name}** | {pros} | {cons} |
{/options}

## Lý do chọn phương án này

{rationale}

## Hệ quả

**Ngắn hạn:** {shortTermConsequences}

**Dài hạn:** {longTermConsequences}

## Khi nào cần revisit

{revisitConditions}

## Links

{#links}
- {description}: {url}
{/links}

---
*Supersedes: {supersedes} | Superseded by: {supersededBy}*
