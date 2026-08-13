<!--
DOEL: Code Review Report

Mục đích:
- Checklist toàn diện cho code quality, security, performance, maintainability
- Evidence-based findings với file paths, line numbers, snippets
- Lưu trữ tại reports/code-review/code-review-{scope}-{date}.md

Sử dụng khi:
- PR reviews formal
- Codebase audits
- Security assessments
- Technical debt analysis
-->
---
# Mẫu báo cáo: Code Review. Điền placeholder → xuất file .md.
report_type: code-review
generated_at: ""   # YYYY-MM-DD hoặc ISO
source: ""        # scope (path/repo) hoặc plan path
agent_or_skill: "" # e.g. dotnet-reviewer, docs-manager
---

# Checklist Code Review

Tài liệu này là checklist toàn diện để đảm bảo chất lượng, bảo mật, khả năng bảo trì, scalability và sẵn sàng vận hành trước khi merge hoặc release code.

## Thông tin người review

- **Tên dự án:** {projectName}
- **Repo/Branch:** {repositoryBranch}
- **Người review:** {reviewerName}
- **Ngày review:** {reviewDate}
- **Ticket / Yêu cầu liên quan:** {ticketReference}
- **Loại thay đổi:** {changeType} (Feature / Bug Fix / Refactor / Hotfix)
- **Breaking Change:** {breakingChange} (Yes/No)
- **Cần migration:** {migrationRequired} (Yes/No)

## Định nghĩa trạng thái & mức độ

**Trạng thái:** Pass | Minor Issue | Major Issue | Blocker | N/A

**Mức độ:** Low | Medium | High | Critical

## Checklist tổng quát

{#generalChecklist}
{item}: {comment}
{/generalChecklist}

## Kiến trúc & Thiết kế

{#architectureReview}

Nhất quán với kiến trúc hệ thống: {status}
Ghi chú: {notes}

Phân tầng / Separation of Concerns: {status}
Ghi chú: {notes}

Đúng domain boundary: {status}
Ghi chú: {notes}

Đánh giá coupling và cohesion: {status}
Ghi chú: {notes}

Tác động đến scalability: {status}
Ghi chú: {notes}

Tác động dependency và transitive risk: {status}
Ghi chú: {notes}

Nợ kỹ thuật phát sinh: {status}
Ghi chú: {notes}

{/architectureReview}

## Chất lượng code

Mục kiểm tra | Trạng thái | Mức độ | Ghi chú
{#codeQuality}
{checkItem} {status} {severity} {notes}
{/codeQuality}

Gợi ý kiểm tra:
- Đọc hiểu & rõ ràng
- Mức abstraction phù hợp
- Chiến lược xử lý lỗi
- Logging đầy đủ
- Xử lý null / edge case
- Tương thích ngược
- Xóa dead code
- Loại bỏ trùng lặp
- Tuân thủ SOLID

## Bảo mật

{#hasSecuritySection}

Mục kiểm tra bảo mật | Trạng thái | Mức độ | Ghi chú
{#securityChecks}
{checkItem} {status} {severity} {comments}
{/securityChecks}

Gợi ý kiểm tra bảo mật (theo OWASP):
- Validate & sanitize đầu vào
- Encode đầu ra
- Validate logic xác thực (authentication)
- Kiểm tra phân quyền (authorization)
- Xử lý session
- Lưu trữ secret / credential
- Quét lỗ hổng dependency
- Injection vulnerabilities
- Mã hóa dữ liệu khi truyền & lưu
- Lộ dữ liệu PII / nhạy cảm
- Rate limiting / chống brute force
- Cấu hình bảo mật

{/hasSecuritySection}

{^hasSecuritySection}
Không có kiểm tra bảo mật cụ thể nào trong review này.
{/hasSecuritySection}

## Kiểm tra hiệu năng

{#performanceChecks}

Khu vực: {title}
Tác động độ phức tạp: {complexityAnalysis}
Benchmark / Đo lường: {benchmarkResult}
Tác động tài nguyên (CPU / Memory / IO): {resourceImpact}
Hiệu quả truy vấn DB: {dbEfficiency}
Chiến lược caching: {cachingStrategy}
Mức rủi ro tải: {riskLevel}
Ghi chú: {details}

{/performanceChecks}

## Phong cách & Best Practices

{#stylePractices}

Quy tắc: {practice}
Vấn đề phát hiện: {issuesFound}

{/stylePractices}

Bao gồm:
- Tuân thủ coding standard
- Quy ước đặt tên
- Tổ chức file/module
- Chất lượng tài liệu
- Rõ ràng của comment
- Định dạng nhất quán

{#isDotNetProject}

### .NET / C# đặc thù

Tham chiếu: src/rules/dotnet/RULE.md, src/rules/dotnet/decisions.md

Mục kiểm tra | Trạng thái | Mức độ | Ghi chú
{#dotNetChecks}
{dotNetCheckItem} {status} {severity} {notes}
{/dotNetChecks}

Gợi ý kiểm tra:
- Naming: PascalCasing/camelCasing, prefix I cho interface, suffix (EventArgs, Exception, Async)
- Async: suffix Async, ConfigureAwait khi cần, không dùng async void (trừ event handler)
- Disposable: dùng IDisposable / IAsyncDisposable đúng cách
- Nullable: nullable reference types và xử lý null
- Dependency Injection: lifecycle (Scoped/Transient/Singleton), không capture DbContext trong singleton
- EF Core: không N+1, AsNoTracking cho read-only, migrations được review
- Packages: `dotnet list package --vulnerable`, không dùng package không còn bảo trì

{/isDotNetProject}

## Độ phủ test

- Có automated tests không? {hasTests}
- Độ phủ test (gần đúng): {coveragePercent}
- Unit Test: {unitCoverage}
- Integration Test: {integrationCoverage}
- E2E Test: {e2eCoverage}
- Edge Case: {edgeCoverage}
- Rủi ro regression đã phủ: {regressionCoverage}
- Rủi ro Flaky Test: {flakyRisk}
- Cần test thủ công: {manualTestNotes}

## Quan sát & Monitoring

{#observability}

Logging đầy đủ: {status}
Đo lường metrics: {status}
Hỗ trợ tracing: {status}
Tác động alerting: {status}
Cần cập nhật dashboard vận hành: {status}
Ghi chú: {notes}

{/observability}

## Bảo trì & Nợ kỹ thuật

{#maintainability}

Độ phức tạp code chấp nhận được: {status}
Tài liệu đã cập nhật: {status}
Cấu hình đã externalize: {status}
Đánh giá khả năng tái sử dụng: {status}
Nợ kỹ thuật phát sinh: {status}
Ghi chú: {notes}

{/maintainability}

## DevOps / Sẵn sàng triển khai

{#deploymentReadiness}

Tác động build pipeline: {status}
Cần thay đổi infrastructure: {status}
Cập nhật biến môi trường: {status}
Migration DB đã review: {status}
Tương thích ngược đã xác minh: {status}
Đã định nghĩa rollback strategy: {status}
Sử dụng feature flag: {status}
Ghi chú: {notes}

{/deploymentReadiness}

## Tuân thủ & Bảo vệ dữ liệu

{#compliance}

Xử lý dữ liệu nhạy cảm đã xác minh: {status}
Tác động tuân thủ quy định: {status}
Tuân thủ quy tắc lưu trữ dữ liệu: {status}
Cần audit logging: {status}
Ghi chú: {notes}

{/compliance}

## Phản hồi từ reviewer khác

{#reviewerFeedbacks}

{reviewerName}: {comment}

{/reviewerFeedbacks}

## Tóm tắt đánh giá rủi ro

- Mức rủi ro tổng thể: {overallRiskLevel}
- Vấn đề blocking: {blockingIssues}
- Công việc follow-up: {followUpTasks}
- Khuyến nghị release: {releaseRecommendation}
- Kế hoạch rollback: {rollbackPlan}

## Ghi chú cuối

{finalNotes}

## Evidence (per finding)

Mỗi finding (status ≠ Pass/N/A) kèm evidence: File (path), Lines (start-end), Snippet (5–10 dòng), Confidence (verified | inferred | requires_verification).

| Finding / Section | File | Lines | Snippet ref | Confidence |
|-------------------|------|-------|-------------|------------|
{#evidence}
{findingRef}	{filePath}	{lineRange}	{snippetRef}	{confidence}
{/evidence}

## Phê duyệt

- Phê duyệt bởi: {approvedBy}
- Ngày phê duyệt: {approvalDate}
- Trạng thái merge: {mergeStatus}
