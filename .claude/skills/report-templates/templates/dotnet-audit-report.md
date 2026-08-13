<!--
DOEL: .NET Project Audit Report (AI Context)

Mục đích:
- Tài liệu hóa kết quả audit dự án .NET (solution, packages, cấu hình, test)
- Là AI-context doc nội bộ cho agent (không ship end-user)
- Được ghi đè bởi các lệnh audit (.vd: dotnet-init:first, dotnet-init:update)
- Lưu trữ tại .claude/docs/dotnet-audit-report.md

Sử dụng khi:
- Chạy audit read-only cho project .NET
- Cần snapshot tổng quan solution + cấu hình kỹ thuật + coverage testing
-->
---
report_type: "dotnet-audit-report"
generated_at: ""
source: ""
agent_or_skill: ""
---

# Báo cáo Audit Dự Án .NET

## 1. Thông tin chung

- **Tên dự án:** {projectName}
- **Đường dẫn repo:** {repositoryPath}
- **Ngày audit:** {generated_at}
- **Agent/Skill:** {agent_or_skill}
- **Scope:** {scope}
- **Ghi chú scope (in-scope / out-of-scope):** {scopeNotes}

## 2. Tổng quan Solution

- **Solution chính (.sln):** {solutionFiles}
- **Số lượng projects (.csproj):** {projectCount}
- **Danh sách projects chính:**
{#projects}
- {projectName} ({projectPath}) — Type: {projectType} (Web/API/Worker/Test/Library/Other)
{\/projects}

### 2.1 Mô hình kiến trúc suy luận được

- **Kiểu kiến trúc:** {architectureStyle} (Monolith / Modular Monolith / Microservices / Layers only / Unknown)
- **Các layer / nhóm project chính:**
{#layers}
- {layerName}: {description}
{\/layers}

## 3. Packages & Dependencies

### 3.1 Tổng quan packages

- **Nguồn cấu hình:** {packageConfigSources} (Directory.Packages.props / PackageReference / khác)
- **Số lượng packages (ước lượng):** {packageCount}

{#packageSummary}
- {category}: {description}
{\/packageSummary}

### 3.2 Packages quan trọng (EF Core, ASP.NET Core, Logging, Testing, v.v.)

{#importantPackages}
- {name} — Version: {version} — Usage: {usage}
{\/importantPackages}

## 4. Cấu hình Host, DI, Logging

### 4.1 Entry points & host bootstrapping

- **Entry points phát hiện:** {entryPoints} (Program.cs / Startup.cs / khác)
- **Kiểu hosting:** {hostingModel} (Generic Host / WebApplicationBuilder / Legacy / Unknown)

### 4.2 Dependency Injection

{#dependencyInjection}
- **Đăng ký services:** {serviceRegistrationPatterns} (AddScoped/AddTransient/AddSingleton, extension methods, module patterns)
- **Nhận xét:** {notes}
{\/dependencyInjection}

### 4.3 Logging & Observability

{#loggingObservability}
- **Logging providers:** {loggingProviders}
- **Mức log mặc định:** {logLevelDefaults}
- **Observability (metrics/tracing) dấu hiệu:** {observabilitySignals}
- **Nhận xét:** {notes}
{\/loggingObservability}

## 5. Analyzers, Nullable, Style Rules

- **Nullable Reference Types:** {nullableStatus} (Enabled/Disabled/Mixed/Unknown)
- **AnalysisLevel / Analyzers:** {analyzersStatus}
- **Style/formatting tools (EditorConfig, StyleCop, ReSharper, v.v.):** {styleTools}
- **Nhận xét tổng quan:** {analysisNotes}

## 6. Cấu hình bí mật & App Settings

> **Lưu ý:** Không ghi giá trị bí mật, chỉ mô tả cấu trúc và vị trí file.

- **File cấu hình chính:** {appSettingsFiles} (appsettings.json, appsettings.{Environment}.json, secrets.json, v.v.)
- **Cách xử lý secrets:** {secretsHandling} (UserSecrets, env vars, KeyVault, file thuần, Unknown)
- **Dấu hiệu thông tin nhạy cảm trong repo:** {sensitiveDataSignals}
- **Nhận xét & rủi ro:** {secretsRiskNotes}

## 7. Testing & Quality Gates

### 7.1 Dự án test & frameworks

- **Projects test phát hiện:** {testProjects}
- **Frameworks:** {testFrameworks} (xUnit/NUnit/MSTest/other)

### 7.2 Coverage & automation (ước lượng)

- **Coverage ước lượng (nếu suy luận được):** {estimatedCoverage}
- **Pipelines / scripts liên quan:** {qualityPipelines} (CI, test, lint scripts)
- **Nhận xét về độ tin cậy tests:** {testReliabilityNotes}

## 8. Tóm tắt Findings chính

{#keyFindings}
### {title}

- **Status:** {status} (Pass / Minor / Major / Blocker / N/A)
- **Severity:** {severity} (Low / Medium / High / Critical)
- **Chi tiết:** {details}
- **Tác động:** {impact}
- **Khuyến nghị:** {recommendation}
{\/keyFindings}

## 9. Khuyến nghị tổng thể

- **Mức độ rủi ro tổng thể:** {overallRisk}
- **Ưu tiên cải thiện (Top 3):**
{#topRecommendations}
1. {item1}
2. {item2}
3. {item3}
{\/topRecommendations}

## 10. Evidence kỹ thuật

Mọi finding quan trọng nên có evidence rõ ràng (file, dòng, snippet rút gọn, mức độ tin cậy).

| Finding | File | Lines | Snippet ref | Confidence |
|---------|------|-------|-------------|------------|
{#evidence}
| {findingRef} | {filePath} | {lineRange} | {snippetRef} | {confidence} |
{\/evidence}

