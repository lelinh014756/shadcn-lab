<!--
DOEL: Database Schema Documentation

Mục đích:
- Tài liệu hóa cấu trúc cơ sở dữ liệu (tables, columns, data types, relationships)
- Hỗ trợ developers, DBAs, stakeholders hiểu và maintain database
- Lưu trữ tại docs/database/schema.md hoặc reports/research/database-schema-{date}.md

Sử dụng khi:
- Thiết kế database mới
- Document database hiện có
- Review schema changes
- Onboarding团队成员 về database structure
-->
---
# Mẫu báo cáo: Schema cơ sở dữ liệu. Điền placeholder → xuất file .md.
report_type: database-schema
generated_at: ""
source: ""
agent_or_skill: ""
---

# Database Schema Documentation

Purpose: This document outlines the structure of the relational database, including information about tables, fields (columns), data types, and relationships between tables. This documentation is essential for developers, database administrators, and stakeholders who need to understand or maintain the database.

General Information
Database Name: {databaseName}
Version: {version}
Author: {author}
Date Created: {creationDate}

{#ormSection}
ORM / Access (optional): {ormAccess} (e.g. EF Core | Dapper | ADO.NET). EF Core mapping: {efCoreEntityOrMigrationRef}.
{/ormSection}

Tables Overview
{#tables}

Table: {tableName}
Description: {tableDescription}

Fields/Columns:
Column Name	Data Type	Nullable	Default	Description
{#columns}{columnName}	{dataType}	{nullable}	{defaultValue}	{columnDescription}{/columns}
Primary Key:
{primaryKey}
{#hasForeignKeys}

Foreign Keys:
Column	References Table	References Column	On Update	On Delete
{#foreignKeys}{fkColumn}	{referencedTable}	{referencedColumn}	{onUpdate}	{onDelete}{/foreignKeys}
{/hasForeignKeys}

{^hasForeignKeys}

No foreign keys defined.

{/hasForeignKeys}

Indexes:
{#indexes}

{indexName}: Columns: {dbColumns}, Unique: {isUnique}
{/indexes}

{^indexes}

No indexes defined.

{/indexes}

{/tables}
