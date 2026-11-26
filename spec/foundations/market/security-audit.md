---
title: How agents audit a codebase's security
description: MKT-19 · Security review by AI agents, of a diff or a whole repository, the static analysis they call, and the OWASP standards they read. Surveyed 2026-11-26
owner: Kevin
version: "1.0"
updated: "2026-11-26"
---

# MKT-19 · How agents audit a codebase's security

Surveyed on 2026-11-26. Read in full: Cloudflare's `security-audit` (commit `c1c8a8c`, 2026-09-14), the
repo and issues of `anthropics/claude-code-security-review`, Anthropic's security guidance at
code.claude.com, `trailofbits/skills`, `semgrep/mcp`, `SocketDev/socket-mcp` and `OWASP/ASVS`. **Not
opened** (the network refused them): Cloudflare's blog, OpenAI's, DeepMind's, GitHub's and Semgrep's
docs and the OWASP GenAI site. What comes from them is marked *unverified*: it was read in search
summaries only.

## The tools

| Tool | Scope | How it cuts false positives | Output | License · price | Where it breaks |
|---|---|---|---|---|---|
| **Cloudflare `security-audit`** | Whole repo, or guidance on one question | A coverage ledger of what was hunted; isolated hunters per attack class; a fresh verifier tries to disprove each candidate; a second one verifies each final record | `findings.json` with three verdicts, `confirmed` (with severity), `needs_validation` (the exact missing fact, no severity) and `rejected`; validated by a schema and two zero-dependency scripts | MIT · the team's model | About 80,000 tokens of instructions; runs target code only in a sandbox it cannot always get, and then reports it as not run |
| **Anthropic `/security-review`** and its GitHub Action | The diff only; old issues out of scope | Over 80 % confidence; one sub-task per candidate re-scores it against 18 hard exclusions (DoS, rate limits, outdated libraries, missing hardening) | Markdown per finding; the Action comments inline and writes JSON | MIT · API usage | Not hardened against prompt injection (README); its filter has been silently off since 2026-02-19, pinned to a retired model (issues #88, #103, #139); a cache keeps a check green on new commits (#120) |
| **Anthropic `claude-security` plugin** | Whole repo, an area, or a diff | Maps the architecture, hunts, and independent verifiers review every finding; a separate agent must vouch for each patch | Markdown, JSONL and SARIF 2.1.0 with CWE; patches never applied | Usage-based; the hosted product needs Enterprise | Nondeterministic; the shell sandbox is Linux only |
| **Trail of Bits skills** | 39 plugins: context building, differential review, variant analysis, insecure defaults, supply chain, `fp-check` | `fp-check`: data flow, exploitability, impact, a 13-question devil's advocate and six gates; hooks keep the agent from stopping early | Per skill; some SARIF | CC-BY-SA-4.0 | The Stop hook blocks unrelated sessions (#510, #342); a ruleset returns 404 (#299); the supply-chain auditor copies credentials into its report (#521) |
| **Semgrep MCP** | Files or repo, by rules: deterministic | Rules, not a model | Findings per rule | MIT; now inside the `semgrep` binary, the repo archived 2025-10-28 | Scan tool broken on 1.159.0 (#11644); arbitrary write on Windows paths (#12022) |
| **CodeQL + Copilot Autofix** | Repo, by queries | Queries; an agent reads alerts through the GitHub MCP, which cannot start a scan | Code-scanning alerts | $30 per active committer per month (*unverified*) | Autofix may not fix, or may add a flaw (*unverified*) |
| **Socket MCP** | Dependencies of eight ecosystems | Package scores and alerts | Scores | MIT; OAuth on each call | "Early development" (README) |
| **OpenAI Codex Security** (was Aardvark) · **Google CodeMender** | Repo and commits | Reproduce in a sandbox; CodeMender adds fuzzing, solvers and a judge of equivalence | Patches for a person | Enterprise preview · not offered | *Unverified*: read in summaries only |

## The standards

| Standard | Version | Source |
|---|---|---|
| OWASP ASVS | 5.0.0, May 2025, CC BY-SA 4.0; cited `v5.0.0-<ch>.<sec>.<req>` | `OWASP/ASVS` README |
| OWASP Top 10 for LLM Applications | 2026 edition, about August 2026 | *Unverified* |
| OWASP Top 10 for Agentic Applications | 2026 edition, December 2025 | *Unverified* |

## Figures

| Figure | Source |
|---|---|
| Cloudflare's skill grew in about six weeks into a harness sweeping 128 repos; raw candidates 20,799, with 7,245 or 12,057 left after validation, depending on the summary | Cloudflare, *Build your own vulnerability harness*, 2026-06-18, *unverified* |
| Different models find different subsets; Cloudflare discovers and validates with different models | Same, *unverified* |

## What repeats

| Pattern | Who |
|---|---|
| A separate agent tries to disprove each finding before it counts | All the agent tools |
| A finding names the boundary crossed and the result; a missing best practice is not one | Cloudflare; Anthropic's exclusions |
| A fact outside the source (deployment, provider, proxy) is not guessed: it is left to validate, without severity | Cloudflare |
| Deterministic analysis is a layer the agent calls, not one it replaces | Semgrep, CodeQL |
| **They fail in silence**: a filter off, a green from a cache, a glob that drops files | Anthropic's Action, Trail of Bits, Semgrep |
