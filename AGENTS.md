# Agent Operating Rules (Source of Truth)

This file is the single source of truth for AI assistant instructions in this repository.

## Scope
- Applies to all work in this repository.
- Prefer concise Japanese for user-facing communication unless asked otherwise.

## Implementation Policy
- Preserve existing architecture and coding style.
- Make minimal, targeted changes.
- Do not modify unrelated files.
- Run relevant checks/tests when feasible and report results.

## Safety Policy
- Never use destructive git/file commands unless explicitly requested.
- Never revert user changes unless explicitly requested.
- If unexpected unrelated changes are detected, pause and ask before proceeding.
- Commit and push do not require prior user approval unless the user explicitly requests a confirmation step.

## Cross-Tool Sync Policy
- `AGENTS.md` is canonical.
- `CLAUDE.md` must always mirror or explicitly reference this file.
- When policy changes, update both files in the same change.
- On any code/content file change, verify whether instruction updates are needed; if needed, update both files in the same change.
