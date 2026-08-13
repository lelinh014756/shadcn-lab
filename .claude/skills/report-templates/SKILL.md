---
name: report-templates
description: "Sinh Markdown từ template khi cần lưu artifact (docs living vs reports snapshot). Áp dụng taxonomy topic→template→output, kèm evidence, metadata, và gating xác nhận trước khi ghi."
---

# Report Templates

## 1) Source of Truth

- **`mapping.ts`** — canonical type definitions + entry array (edit here).
- **`mapping.json`** — generated artifact for consumers/CI (do NOT hand-edit).
- Regenerate: `npx ts-node --transpile-only --project scripts/tsconfig.json scripts/export-mapping.ts`
- Validate: `npx ts-node --transpile-only --project scripts/tsconfig.json tests/validate-mapping.test.ts`
- Templates: `.claude/skills/report-templates/templates/`

## 2) Scope & Triggers

- Dùng khi: cần sinh file Markdown theo taxonomy (docs living, reports snapshot, plans, ADR, feature spec).
- Không dùng khi: chỉ trao đổi miệng, không cần tạo file; chỉnh sửa code/CI; chưa rõ topic/slug.
- Ngôn ngữ: nội dung Việt; code giữ nguyên tiếng Anh nếu trích dẫn.

## 3) Permissions & Safety

- Mặc định **read-only**. Bất kỳ hành động ghi file / chạy build / test phải **hỏi trước**.
- Snapshot (reports) chỉ ghi sau khi user/agent đồng ý ở bước VERIFY. **Không overwrite** sau khi ghi.
- Tuyệt đối **không bịa** số liệu, evidence, đường dẫn. Thiếu dữ liệu → dừng và hỏi.

## 4) Taxonomy (5 thư mục)

| Loại | Thư mục | Timestamp | Overwrite |
|------|---------|-----------|-----------|
| Living docs | `docs/` (+ subdirs), `features/`, `docs/adr/` | none | hỏi khi clash |
| Snapshot reports | `reports/` | `YYMMDD-HHMM` | **không bao giờ** |
| Plans | `plans/` | `YYMMDD` | thêm `HHMM` khi clash |
| Singleton | `.claude/docs/` | none | luôn overwrite |
| Feature spec | `features/{slug}/` | none | hỏi khi clash |

## 5) Topic → Template → Output Path

| Topic | Template | Output |
|-------|----------|--------|
| `adr` | adr.md | `docs/adr/ADR-{NNN}-{slug}.md` |
| `api-documentation` | api-documentation.md | `docs/api/{slug}.md` |
| `database-schema` | database-schema.md | `docs/database/{slug}.md` |
| `architecture-blueprint` | architecture-blueprint.md | `docs/architecture/{slug}.md` |
| `system-architecture` | system-architecture.md | `docs/system-architecture.md` *(flat, docs:init)* |
| `deployment-guide` | deployment-guide.md | `docs/deployment-guide.md` |
| `brd` | brd.md | `docs/business/brd-{slug}.md` |
| `prd` | prd.md | `docs/product/prd-{slug}.md` |
| `srs` | srs.md | `docs/specs/srs-{slug}.md` |
| `feature-spec` | feature-spec.md | `features/{slug}/spec.md` |
| `tech-spec` | tech-spec.md | `reports/research/{timestamp}-tech-spec-{slug}.md` |
| `code-review` | code-review.md | `reports/code-review/{timestamp}-{slug}.md` |
| `status-report` | status-report.md | `reports/progress/{timestamp}-{slug}.md` |
| `project-summary` | project-summary.md | `reports/progress/{timestamp}-{slug}.md` |
| `generic-report` | generic-report.md | `reports/{type}/{timestamp}-{slug}.md` *(hỏi type)* |
| `it-project-plan` | it-project-plan.md | `plans/project-plan/{timestamp}-{slug}.md` |
| `generic-plan` | generic-plan-template.md | `plans/{timestamp}-{slug}.md` |
| `dotnet-audit-report` | dotnet-audit-report.md | `.claude/docs/dotnet-audit-report.md` *(singleton)* |
| `generic-doc` | generic-doc-template.md | `docs/{slug}.md` |
| `project-overview-pdr` | project-overview-pdr.md | `docs/project-overview-pdr.md` |
| `roadmap` | project-roadmap.md | `docs/project-roadmap.md` |
| `design-guidelines` | design-guidelines.md | `docs/design-guidelines.md` |

Full mapping: `mapping.ts` / `mapping.json`.

## 6) Timestamp & Overwrite Rules

- **Reports** → `YYMMDD-HHMM` (e.g. `260305-1430`). Không overwrite sau khi ghi.
- **Plans** → `YYMMDD`. Nếu path đã tồn tại → append HHMM suffix thay vì overwrite.
- **ADR** → Tự động suggest `NNN = max(existing) + 1`. Cho phép override.
- **`generic-report`** → **Bắt buộc hỏi subtype** (type token) trước khi resolve path.
- **`dotnet-audit-report`** → Singleton, luôn overwrite, không hỏi.
- **`deployment-guide`** → Living doc, hỏi trước khi overwrite.

## 7) Evidence & Completeness

- Mọi finding ≠ Pass/N/A phải có evidence: {file path, line start-end, snippet 5-10 dòng, confidence = verified|inferred|requires_verification}.
- Required fields thiếu → **STOP**, liệt kê thiếu gì và hỏi user. Không sinh placeholder (TBD/N/A giả).

## 8) Metadata (bắt buộc)

```yaml
---
report_type: ""          # status-report | code-review | tech-spec | ... (xem Topic taxonomy)
generated_at: ""         # ISO 8601: YYYY-MM-DDTHH:mm:ss+07:00
period: ""               # YYYY-Www | YYYY-MM | YYYY-QN (bỏ trống nếu không áp dụng)
status: draft            # draft | final
source: ""               # codebase path hoặc URL nguồn dữ liệu
generated_by: ""         # agent/skill tạo ra (e.g. report-templates, code-reviewer)
triggered_by: ""         # user | hook | agent-chain — ai/cái gì khởi động
plan_ref: ""             # path tới plan dir, e.g. plans/260316-2243-foo/ (bỏ trống nếu không có)
---
```

**Rules:**
- `report_type` phải khớp với Topic column trong taxonomy (§5).
- `status: draft` là default; chuyển sang `final` sau khi human review/approve.
- `generated_by` vs `triggered_by`: agent thực thi ≠ initiator (user/hook/pipeline).
- `plan_ref`: bắt buộc điền nếu report sinh ra từ một plan context.

## 9) Workflow (PRODUCE → VERIFY → EXECUTE)

- **PRODUCE**: xác định topic → template → output path; thu thập dữ liệu thật; điền placeholder có dữ liệu.
- **VERIFY**: hiển thị path dự kiến + tóm tắt nội dung; nếu thiếu dữ liệu → dừng và hỏi; nếu file tồn tại → hỏi overwrite / tạo bản mới; **hỏi xác nhận trước khi ghi**.
- **EXECUTE**: chỉ sau khi được đồng ý; ghi file đúng path; snapshot không sửa sau khi ghi.

## 10) Quick Classification (fallback)

- **docs**: documentation, guide, reference, api, schema, spec, manual, handbook, requirements, domain, business, stakeholder, user-story, use-case
- **reports**: review, audit, assessment, evaluation, status, summary, checklist, scan, analysis (output kết quả)
- **plans**: plan, roadmap, timeline, milestone, sprint, backlog, proposal
- Overlap: "gap analysis" → reports; "domain analysis" (đặc tả) → docs.
- Không khớp → mặc định reports + `generic-report` (yêu cầu subtype).
