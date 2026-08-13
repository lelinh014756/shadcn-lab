// Canonical mapping for report-templates skill
// Source of truth for topic -> template -> output path and policies
// NOTE: mapping.json is generated from this file via: ts-node scripts/export-mapping.ts

export type TimestampPolicy = "YYMMDD" | "YYMMDD-HHMM" | "none";

export type Kind = "doc" | "report" | "plan" | "feature" | "adr";

export interface MappingPolicy {
  /** Format of timestamp token in pathPattern */
  timestamp?: TimestampPolicy;
  /** ADR: auto-suggest NNN = max(existing) + 1 */
  adrAutoSuggest?: boolean;
  /** Require user to provide a subtype before writing (e.g. generic-report) */
  requireSubtypePrompt?: boolean;
  /** True = file is a point-in-time snapshot, never mutated after write */
  snapshot?: boolean;
  /** Plan files: if target path already exists, append HHMM suffix to avoid overwrite */
  clashSuffix?: boolean;
}

export interface MappingEntry {
  topic: string;
  kind: Kind;
  template: string; // filename under templates/
  pathPattern: string; // may include {slug}, {NNN}, {timestamp}
  overwrite?: boolean; // true only for intentional singletons
  area?: string; // optional classification, e.g., architecture, product
  typeLabel?: string; // human label for prompts
  policy?: MappingPolicy;
}

export const mapping: MappingEntry[] = [
  // ── ADR ──────────────────────────────────────────────────────────────────
  {
    topic: "adr",
    kind: "adr",
    template: "adr.md",
    pathPattern: "docs/adr/ADR-{NNN}-{slug}.md",
    policy: { adrAutoSuggest: true, snapshot: false },
  },

  // ── Living docs ──────────────────────────────────────────────────────────
  {
    topic: "api-documentation",
    kind: "doc",
    template: "api-documentation.md",
    pathPattern: "docs/api/{slug}.md",
    area: "api",
  },
  {
    topic: "database-schema",
    kind: "doc",
    template: "database-schema.md",
    pathPattern: "docs/database/{slug}.md",
    area: "database",
  },
  {
    topic: "architecture-blueprint",
    kind: "doc",
    template: "architecture-blueprint.md",
    pathPattern: "docs/architecture/{slug}.md",
    area: "architecture",
  },
  {
    topic: "deployment-guide",
    kind: "doc",
    template: "deployment-guide.md",
    pathPattern: "docs/deployment-guide.md",
    overwrite: false,
  },
  // Short aliases: brd / prd / srs / feature-spec
  {
    topic: "brd",
    kind: "doc",
    template: "brd.md",
    pathPattern: "docs/business/brd-{slug}.md",
    area: "business",
    typeLabel: "Business Requirements Document",
  },
  {
    topic: "prd",
    kind: "doc",
    template: "prd.md",
    pathPattern: "docs/product/prd-{slug}.md",
    area: "product",
    typeLabel: "Product Requirements Document",
  },
  {
    topic: "srs",
    kind: "doc",
    template: "srs.md",
    pathPattern: "docs/specs/srs-{slug}.md",
    area: "specs",
    typeLabel: "Software Requirements Specification",
  },
  {
    topic: "feature-spec",
    kind: "feature",
    template: "feature-spec.md",
    pathPattern: "features/{slug}/spec.md",
    area: "feature",
  },
  {
    topic: "generic-doc",
    kind: "doc",
    template: "generic-doc.md",
    pathPattern: "docs/{slug}.md",
  },

  // ── Reports (snapshot, YYMMDD-HHMM, no overwrite) ────────────────────────
  {
    topic: "tech-spec",
    kind: "report",
    template: "tech-spec.md",
    pathPattern: "reports/research/{timestamp}-tech-spec-{slug}.md",
    policy: { timestamp: "YYMMDD-HHMM", snapshot: true },
  },
  {
    topic: "code-review",
    kind: "report",
    template: "code-review.md",
    pathPattern: "reports/code-review/{timestamp}-{slug}.md",
    policy: { timestamp: "YYMMDD-HHMM", snapshot: true },
  },
  {
    topic: "status-report",
    kind: "report",
    template: "status-report.md",
    pathPattern: "reports/progress/{timestamp}-{slug}.md",
    policy: { timestamp: "YYMMDD-HHMM", snapshot: true },
  },
  {
    topic: "project-summary",
    kind: "report",
    template: "project-summary.md",
    pathPattern: "reports/progress/{timestamp}-{slug}.md",
    policy: { timestamp: "YYMMDD-HHMM", snapshot: true },
  },
  {
    topic: "generic-report",
    kind: "report",
    template: "generic-report.md",
    pathPattern: "reports/{type}/{timestamp}-{slug}.md",
    policy: { timestamp: "YYMMDD-HHMM", snapshot: true, requireSubtypePrompt: true },
    typeLabel: "Generic Report (requires subtype)",
  },

  // ── Plans (YYMMDD, clash → append HHMM) ──────────────────────────────────
  {
    topic: "it-project-plan",
    kind: "plan",
    template: "it-project-plan.md",
    pathPattern: "plans/project-plan/{timestamp}-{slug}.md",
    policy: { timestamp: "YYMMDD", snapshot: false, clashSuffix: true },
  },
  {
    topic: "generic-plan",
    kind: "plan",
    template: "generic-plan.md",
    pathPattern: "plans/{timestamp}-{slug}.md",
    policy: { timestamp: "YYMMDD", snapshot: false, clashSuffix: true },
  },

  // ── docs:init specific ──────────────────────────────────────────────────
  {
    topic: "system-architecture",
    kind: "doc",
    template: "architecture-blueprint.md",
    pathPattern: "docs/system-architecture.md",
    area: "architecture",
    typeLabel: "System Architecture",
  },
  {
    topic: "project-overview-pdr",
    kind: "doc",
    template: "project-overview-pdr.md",
    pathPattern: "docs/project-overview-pdr.md",
    area: "product",
    typeLabel: "Project Overview / PDR",
  },
  {
    topic: "roadmap",
    kind: "doc",
    template: "roadmap.md",
    pathPattern: "docs/project-roadmap.md",
    area: "plans",
  },
  {
    topic: "design-guidelines",
    kind: "doc",
    template: "design-guidelines.md",
    pathPattern: "docs/design-guidelines.md",
    area: "design",
  },

  // ── Singleton (always overwrite) ──────────────────────────────────────────
  {
    topic: "dotnet-audit-report",
    kind: "doc",
    template: "dotnet-audit-report.md",
    pathPattern: ".claude/docs/dotnet-audit-report.md",
    overwrite: true,
  },
];

export default mapping;
