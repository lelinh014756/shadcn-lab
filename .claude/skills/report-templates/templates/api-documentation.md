<!--
DOEL: API Documentation

Mục đích:
- Tài liệu hóa REST/gRPC API endpoints, request/response formats
- Authentication, error codes, examples cho developers & integrators
- Lưu trữ tại docs/api/api-docs.md hoặc reports/research/api-{name}.md

Sử dụng khi:
- API design reviews
- External API contracts
- Client SDK development
- Integration documentation
-->
---
# Mẫu báo cáo: Tài liệu API. Điền placeholder → xuất file .md.
report_type: api-documentation
generated_at: ""
source: ""
agent_or_skill: ""
---

# API Documentation: {apiName}

## Introduction
Purpose: This document provides a comprehensive overview of the {apiName} API, including available endpoints, request/response formats, authentication requirements, and other technical specifications intended to assist developers and system integrators in utilizing the API effectively.

## General Information
API Base URL: {baseUrl}
API Version: {version}
Contact Email: {contactEmail}
Authentication Method: {authentication}

{#stackSection}
Stack / Framework (optional)
Framework: {framework} (e.g. ASP.NET Core 8)
API Versioning: {apiVersioning} (e.g. URL / Header / Query)
OpenAPI / Swagger: {openApiUrl}
API surface review: See src/rules/dotnet/RULE.md (naming conventions) when reviewing public API.
{/stackSection}

## Authentication
{authenticationDetails}

{#authenticationExample}

Authentication Example
{authExampleCode}
{/authenticationExample}

## Error Codes
| Code | Message | Description |
|------|---------|-------------|
{#errors}
| {code} | {message} | {description} |
{/errors}

## Resources / Endpoints
{#endpoints}

{name}
Method: {method}

URL: {url}

Description: {description}

{#parameters}

Request Parameters
Name	Type	Required	Description
{#paramRows}{paramName}	{paramType}	{paramRequired}	{paramDescription}{/paramRows}
{/parameters}

Example Request:
{*requestExample}
Example Response:
{*responseExample}
{#csharpExample}

Example (C# / HttpClient):
{*csharpExampleCode}
{/csharpExample}
{/endpoints}

## Change Log
{#changelog}

{date}: {change}
{/changelog}

## Glossary / Definitions
{#glossary}

{term}: {definition}
{/glossary}
