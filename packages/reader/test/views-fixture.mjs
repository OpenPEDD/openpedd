// A small product spec where everything is linked: one entity with states, two PRDs with flows, one
// decision, the security and integrations foundations. Each test breaks one thing on a copy.
const fm = (title, extra = '') => `---\ntitle: ${title}\ndescription: ${title}\nowner: Ana\nversion: "1.0"\nupdated: "2026-11-22"\n${extra}---\n\n`;

export const product = () => ({
  'workspace.yaml': 'project: acme\n',
  'spec/modules/README.md': `${fm('Modules')}| Module | Code |\n|---|---|\n| [jobs](jobs/prd.md) | \`JOB\` |\n| [billing](billing/prd.md) | \`BIL\` |\n`,
  'spec/foundations/domain/index.md': `${fm('Domain')}| ID | Entity |\n|---|---|\n| \`ENT-01\` | [Job Post](job-post.md) |\n| \`ENT-02\` | [Invoice](invoice.md) |\n`,
  'spec/foundations/domain/job-post.md': `${fm('Job Post', '')}# ENT-01 · Job Post

A role a company wants to fill, published for candidates.

## Fields

| Field | Type | What it holds |
|---|---|---|
| \`title\` | text | What the role is called |
| \`invoices\` | ENT-02[] | What was billed for it ([Invoice](invoice.md)) |

## States

| State | Means |
|---|---|
| \`draft\` | Being written |
| \`published\` | Candidates see it |
| \`closed\` | Filled or dropped |

## Transitions

| From | To | When | By |
|---|---|---|---|
| \`draft\` | \`published\` | The company publishes it | company |
| \`published\` | \`closed\` | The role is filled | company |
`,
  'spec/foundations/domain/invoice.md': `${fm('Invoice')}# ENT-02 · Invoice

What a company pays for a post.

## Fields

| Field | Type | What it holds |
|---|---|---|
| \`total\` | money | The amount |
`,
  'spec/foundations/roles/README.md': `${fm('Roles & Permissions')}## Permissions

| Action | company | candidate |
|---|---|---|
| Publish a post | yes | no |
| Apply | no | yes |
| Pay | own | no |
`,
  'spec/foundations/security/README.md': `${fm('Security Policy')}## Tables

| Table | Protected by | Roles | Rule |
|---|---|---|---|
| \`job_posts\` | \`posts_rls\` | company | Only its company writes it |

## SEC-01 · A company sees only its own posts

Holds for every read of a [Job Post](../domain/job-post.md) (\`ENT-01\`).
`,
  'spec/foundations/integrations/README.md': `${fm('Integrations')}## Providers

| INT | Provider | Used for | Used by |
|---|---|---|---|
| \`INT-01\` | Stripe | Payments | \`apps/app\` |
`,
  'spec/modules/jobs/prd.md': `${fm('jobs', 'status: draft\n')}# \`jobs\`

## Flows

### F1 · Publish a post

| Step | Role | Does |
|---|---|---|
| 1 | company | Writes the post |
| 2 | company | Publishes it |

### F2 · Close a post

| Step | Role | Does |
|---|---|---|
| 1 | company | Marks it filled |

| Flow | From | What changes | Ends in |
|---|---|---|---|
| Alternate · A draft saved | F1.1 | It is saved, not published | A draft |

## Requirements

| ID | Requirement | Reason | Roles | Criteria | Flows | Status |
|---|---|---|---|---|---|---|
| \`FR-JOB-01\` | When a company publishes a post, the system shall show it to candidates | Reach | company | \`AC1\` | F1 | \`draft\` |
| \`FR-JOB-02\` | When a post is filled, the system shall close it | Clean list | company | \`AC1\` | F2 | \`draft\` |

## Permissions

| Action | company | candidate |
|---|---|---|
| Publish a post | yes | no |

## States

| Entity | From | To | Flow |
|---|---|---|---|
| \`ENT-01\` | \`draft\` | \`published\` | F1 |
| \`ENT-01\` | \`published\` | \`closed\` | F2 |

## Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| \`FR-JOB-01.AC1\` | A draft | It is published | Candidates see it |
| \`FR-JOB-02.AC1\` | A published post | It is filled | It is closed |

Uses [Job Post](../../foundations/domain/job-post.md).
`,
  'spec/modules/billing/prd.md': `${fm('billing', 'status: draft\n')}# \`billing\`

## Flows

### F1 · Pay

| Step | Role | Does |
|---|---|---|
| 1 | company | Pays the invoice |

## Requirements

| ID | Requirement | Reason | Roles | Criteria | Flows | Status |
|---|---|---|---|---|---|---|
| \`FR-BIL-01\` | When a company pays, the system shall mark the \`ENT-02\` paid | Revenue | company | \`AC1\` | F1 | \`draft\` |

## Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| \`FR-BIL-01.AC1\` | An invoice | It is paid | It is marked paid |
`,
  'spec/decisions/DEC-01-posts-expire.md': `${fm('DEC-01 · Posts close when filled')}# DEC-01 · Posts close when filled

**Closes:** \`Q-01\` · **Date:** 2026-11-22

A filled post closes ([\`FR-JOB-02\`](../modules/jobs/prd.md#requirements)).
`,
  'spec/history/history.jsonl': '{"path": "modules/jobs/prd.md", "version": "1.0", "date": "2026-11-22", "change": "CHG-001", "story": null, "stage": "specify", "summary": "jobs"}\n',
});
