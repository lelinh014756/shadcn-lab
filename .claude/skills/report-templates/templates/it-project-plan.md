<!--
DOEL: IT Project Plan

Mục đích:
- Định nghĩa scope, objectives, milestones, deliverables, resources, timeline
- Làm roadmap cho stakeholders và team trong project lifecycle
- Lưu trữ tại docs/delivery/project-plan.md hoặc plans/project-plan-{name}.md

Sử dụng khi:
- Khởi tạo dự án mới
- Kick-off meetings với stakeholders
- Tracking progress theo milestones
- Resource planning và risk assessment
-->
---
# Mẫu báo cáo: Kế hoạch dự án IT. Điền placeholder → xuất file .md.
report_type: it-project-plan
generated_at: ""
source: ""
agent_or_skill: ""
---

# IT Project Plan

**Links to living:** [Roadmap](./docs/delivery/roadmap.md), [RAID](./docs/delivery/raid.md), [Milestones](./docs/product/milestones.md) — tham chiếu, không copy nội dung.

This document outlines the scope, objectives, key milestones, deliverables, resources, and timeline for the successful execution of the IT project. It serves as a guiding roadmap for stakeholders and project team members throughout the project lifecycle.

1. Project Overview
Project Name: {projectName}

Project Manager: {projectManager}

Client/Stakeholder: {clientName}

Start Date: {startDate}

End Date: {endDate}

Purpose: {projectPurpose}

2. Objectives
{#objectives}

{objectiveDescription}
{/objectives}

3. Scope
In Scope:

{#inScopeItems}

{item}
{/inScopeItems}

Out of Scope:

{#outOfScopeItems}

{item}
{/outOfScopeItems}

4. Milestones
Milestone	Description	Due Date
{#milestones}{milestone}	{description}	{dueDate}{/milestones}
5. Project Team
Name	Role	Responsibilities
{#teamMembers}{name}	{role}	{responsibilities}{/teamMembers}
6. Resource Requirements
{#resources}

{resourceType}: {details}
{/resources}

7. Timeline
Phase	Start Date	End Date	Responsible
{#timeline}{phase}	{phaseStart}	{phaseEnd}	{owner}{/timeline}
8. Risk Assessment
{#risks}

{riskTitle}: {riskDescription} (Mitigation: {mitigationPlan})
{/risks}

9. Assumptions and Constraints
Assumptions:

{#assumptions}

{assumption}
{/assumptions}

Constraints:

{#constraints}

{constraint}
{/constraints}

10. Approval
Approver Name	Role	Approval Date
{#approvals}{approverName}	{approverRole}	{approvalDate}{/approvals}
