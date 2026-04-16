# Skill Registry

Project: Negocio
Generated: 2026-04-09

## Resolution
- Project-level skills: none detected
- Project conventions: none detected in repository root
- User-level registries scanned: `~/.config/opencode/skills`, `~/.claude/skills`, `~/.gemini/skills`, `~/.cursor/skills`, `~/.copilot/skills`
- Deduplication rule: project-level would win; otherwise first user-level canonical entry used

## Available Skills

| Skill | Source | Trigger | Purpose |
|---|---|---|---|
| branch-pr | ~/.config/opencode/skills | Create/open a PR or prepare changes for review | PR workflow with issue-first enforcement |
| issue-creation | ~/.config/opencode/skills | Create a GitHub issue, report a bug, request a feature | Issue workflow with templates and approval flow |
| go-testing | ~/.config/opencode/skills | Write Go tests, Bubbletea tests, add Go coverage | Go testing patterns and conventions |
| judgment-day | ~/.config/opencode/skills | Ask for judgment day / dual review / adversarial review | Parallel blind review and fix loop |
| skill-creator | ~/.config/opencode/skills | Create a new skill or AI instruction set | Skill authoring workflow |

## Compact Rules

### branch-pr
- Every PR MUST link an approved issue
- Every PR MUST have exactly one `type:*` label

### issue-creation
- Use issue templates, not blank issues
- PRs depend on approved issues

### go-testing
- Use table-driven tests in Go when applicable
- Prefer direct model/state testing for Bubbletea flows

### judgment-day
- Use only when explicitly requested
- Resolve project standards before launching dual review

### skill-creator
- Create skills only for repeated, non-trivial patterns
- Include explicit triggers and critical rules

## Conventions Files
- None detected in project root
