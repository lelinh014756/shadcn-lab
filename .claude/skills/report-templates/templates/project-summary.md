<!--
DOEL: Project Summary & Assessment

Mục đích:
- Snapshot tổng quan dự án cho PM + Tech Lead
- Bối cảnh = link đến living docs (không copy)
- Đánh giá = delta (thay đổi) + kết luận + ưu tiên (P0/P1/P2)
- Lưu trữ tại reports/progress/project-summary-{date}.md

Sử dụng khi:
- Milestone assessments
- Periodic reviews (monthly/quarterly)
- Management reporting
- New stakeholder onboarding
-->
---
# Mẫu: Tổng hợp & đánh giá dự án (PM + Tech Lead). Snapshot: bối cảnh = link living; đánh giá = delta + kết luận + ưu tiên.
report_type: project-summary-assessment
generated_at: ""
source: ""
agent_or_skill: ""
---

# Project Summary & Assessment — {projectName}

**Date:** {date}  
**Owner:** {owner}  
**Scope assessed:** {scopeAssessed}  
**Assessment type:** Full | Module | Milestone  
**Baseline / So với:** {baseline}  
**Audience:** Management / Team / New joiners  
**Status:** Draft | Final

> **Kỳ vọng đọc:** §1 = ~1 trang (2–5 phút). §2–9 = chi tiết (30–60 phút).

---

## 1) Executive Summary (1 trang)

### 1.1 Mục tiêu dự án
- **Problem:** {problem}
- **Goal(s):** {goals}
- **Non-goals:** {nonGoals}

### 1.2 Tình trạng hiện tại (RAG)
- **Schedule:** 🟢/🟡/🔴 — {scheduleReason}
- **Scope:** 🟢/🟡/🔴 — {scopeReason}
- **Quality:** 🟢/🟡/🔴 — {qualityReason}
- **Risks:** 🟢/🟡/🔴 — {risksReason}

### 1.3 Những gì đã làm được (Outcomes)
- ✅ O1: {outcome1}
- ✅ O2: {outcome2}
- 🚧 O3: {outcome3} (ETA: {eta3})

### 1.4 Top 5 vấn đề / rủi ro cần xử lý
*(5 bullet ngắn; bảng đầy đủ → §6.2 hoặc link [RAID](link).)*
1) {issue1} — Impact: H/M/L — Owner: {owner1} — ETA: {eta1}
2) {issue2}
3) {issue3}
4) {issue4}
5) {issue5}

### 1.5 Khuyến nghị (ưu tiên)
*(§1.5 = tóm tắt cho quản lý; chi tiết bảng → §8.)*
- **P0 (ngay):** {p0}
- **P1 (kỳ kế):** {p1}
- **P2 (sau):** {p2}

### 1.6 Next steps (30/60/90 ngày)
- **30 ngày:** {next30}
- **60 ngày:** {next60}
- **90 ngày:** {next90}

---

## 2) Bối cảnh & phạm vi đánh giá

### 2.1 Context links (Living Docs)
- Project Brief: {linkProjectBrief}
- Roadmap: {linkRoadmap}
- Milestones: {linkMilestones}
- RAID: {linkRaid}
- Architecture overview: {linkArchitecture}

### 2.2 In-scope / Out-of-scope
- In-scope: {inScope}
- Out-of-scope: {outOfScope}

### 2.3 Assumptions
- A1: {assumption1}
- A2: {assumption2}

---

## 3) Tiến độ & Delivery

### 3.1 Milestone progress
| Milestone | Outcome | Status | ETA | Notes |
|-----------|---------|--------|-----|-------|
| M0 | {outcomeM0} | ✅/🚧/⛔ | {etaM0} | {notesM0} |

### 3.2 Kế hoạch đã thực hiện (Plans)
*(Chỉ link + 1 dòng kết quả (pass/fail, note); không tóm tắt nội dung plan.)*
- {plan1Link} — {plan1Result}
- {plan2Link} — {plan2Result}

### 3.3 Báo cáo theo thời điểm (Reports)
*(Chỉ link + 1 dòng nếu cần; không tóm tắt nội dung report.)*
- {reportWeeklyLink}
- {reportRetroLink}
- {reportSecurityLink}

---

## 4) Đánh giá kỹ thuật (Tech Lead view)
*(Mỗi mục 2–5 dòng hoặc bullet; chi tiết → link living docs.)*

### 4.1 Architecture fit (đúng mục tiêu chưa)
- Tổng quan: {archOverview}
- Điểm mạnh: {archStrengths}
- Điểm yếu / debt: {archWeaknesses}

### 4.2 Codebase health
- Structure/module boundaries: {codeStructure}
- Dependency hygiene: {dependencyHygiene}
- Duplication/hotspots: {duplicationHotspots}
- Maintainability: {maintainability}

### 4.3 Build/CI/CD
- Build reproducibility: {buildRepro}
- CI checks: build / test / lint / typecheck / security scan — {ciChecks}
- Release pipeline: {releasePipeline}

### 4.4 Quality metrics (điền cái có, N/A nếu không)
- Test coverage: {testCoverage}
- Critical paths tested: {criticalPathsTested}
- Static analysis: {staticAnalysis}
- Bug trend: {bugTrend}
- Performance baseline: {perfBaseline}

### 4.5 Security (mức vừa đủ cho dự án nhỏ)
- Secrets hygiene: {secretsHygiene}
- Dependency vulnerabilities: {depVulns}
- Threat model (high-level): {threatModel}
- OWASP/secure coding checklist: {owaspChecklist}

---

## 5) Đánh giá quản lý dự án (PM view)
*(Mỗi mục 2–5 dòng hoặc bullet; chi tiết → link.)*

### 5.1 Scope & requirement management
- Requirement clarity: {reqClarity}
- Change control: {changeControl}
- Definition of Done: {dod}

### 5.2 Planning & execution
- Cadence (weekly/sprint): {cadence}
- Tracking (issue board): {tracking}
- Predictability: {predictability}

### 5.3 Team & ownership
- Ownership map/RACI: {ownershipRaci}
- Onboarding friction: {onboardingFriction}
- Bus factor: {busFactor}

### 5.4 Communication & stakeholder management
- Stakeholder updates: {stakeholderUpdates}
- Decision transparency: {decisionTransparency}
- Escalation path: {escalationPath}

---

## 6) RAID (tóm tắt)
*(Top items; đầy đủ → link RAID log.)*

### 6.1 Risks (Top)
| ID | Risk | Impact | Likelihood | Mitigation | Owner | ETA |
|----|------|--------|------------|------------|-------|-----|
| R1 | {risk1} | H/M/L | H/M/L | {mit1} | {ownerR1} | {etaR1} |

### 6.2 Issues (Top)
*(Bảng hoặc "Xem [RAID](link)". §1.4 đã có 5 bullet tóm tắt.)*
| ID | Issue | Severity | Next action | Owner | ETA |
|----|-------|----------|-------------|-------|-----|
| I1 | {issueI1} | H/M/L | {nextAction1} | {ownerI1} | {etaI1} |

### 6.3 Dependencies (Top)
| ID | Dependency | Needed by | Owner | Status |
|----|-------------|------------|-------|--------|
| D1 | {dep1} | {neededBy1} | {ownerD1} | {statusD1} |

---

## 7) Scorecard (đánh giá nhanh theo trục)
> 1 = yếu, 3 = ổn, 5 = tốt. **Mọi score cần ≥1 evidence (số liệu hoặc link).** Ví dụ Evidence: coverage 72%, build time 3m, [doc](link).

| Area | Score (1-5) | RAG | Evidence | Notes |
|------|-------------|-----|----------|-------|
| Scope clarity | {scoreScope} | 🟢/🟡/🔴 | {evidenceScope} | {notesScope} |
| Delivery predictability | {scoreDelivery} | 🟢/🟡/🔴 | {evidenceDelivery} | {notesDelivery} |
| Code maintainability | {scoreCode} | 🟢/🟡/🔴 | {evidenceCode} | {notesCode} |
| Test strategy | {scoreTest} | 🟢/🟡/🔴 | {evidenceTest} | {notesTest} |
| CI/CD readiness | {scoreCicd} | 🟢/🟡/🔴 | {evidenceCicd} | {notesCicd} |
| Security baseline | {scoreSecurity} | 🟢/🟡/🔴 | {evidenceSecurity} | {notesSecurity} |
| Documentation/onboarding | {scoreDocs} | 🟢/🟡/🔴 | {evidenceDocs} | {notesDocs} |
| Ownership/RACI | {scoreOwnership} | 🟢/🟡/🔴 | {evidenceOwnership} | {notesOwnership} |

---

## 8) Khuyến nghị & Kế hoạch hành động
*(Chi tiết owner, ETA, dependency; §1.5 = tóm tắt.)*

### 8.1 Prioritized actions
| Priority | Action | Outcome | Owner | ETA | Dependency |
|----------|--------|---------|-------|-----|------------|
| P0 | {actionP0} | {outcomeP0} | {ownerP0} | {etaP0} | {depP0} |
| P1 | {actionP1} | {outcomeP1} | {ownerP1} | {etaP1} | {depP1} |

### 8.2 Quick wins (≤ 1 tuần)
- {quickWin1}
- {quickWin2}

### 8.3 Strategic improvements (1–4 tuần)
- {strategic1}
- {strategic2}

### 8.4 Longer-term (1–3 tháng)
- {longTerm1}
- {longTerm2}

---

## 9) Appendix
*(Chỉ link/ref; không copy nội dung.)*
- Links to key PRs / issues: {linkPrs}, {linkIssues}
- Glossary: {linkGlossary}
- Decisions (ADR/decision log): {linkAdr}, {linkDecisionLog}
