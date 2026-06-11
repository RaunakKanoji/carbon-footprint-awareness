# Development Workflow

This file defines how to use the context and feature specifications to build Carbon Compass AI. It ensures a disciplined, spec driven approach to development and keeps the implementation aligned with the defined architecture and goals.

## Approach

Follow a spec driven development process anchored in the context files in the `carbon_context/` directory and the feature specifications in the `features/` directory. Before starting any new code, read the relevant context file(s) and associated feature specification(s). These documents define the scope, architecture, coding standards, UI patterns and acceptance criteria. Do not infer or invent behaviour that is not documented.

## Scoping Rules

- Work on one feature at a time, as defined in the `features/` directory.
- Break down large features into smaller sub‑tasks when necessary (for example, implementing the API and the UI separately).
- Do not implement functionality that is not described in the feature specification or context files. If a behaviour seems useful but is undocumented, add it as an open question in the progress tracker.
- If a feature touches multiple system boundaries (such as API and background jobs), implement each boundary in separate steps or commits to simplify testing and review.

## When to Split Work

Split a feature into smaller units if:

- It requires both server and client components with different responsibilities.
- It mixes database migrations with UI changes.
- It introduces a new background workflow (Trigger.dev) in addition to route handlers.
- It modifies core infrastructure or architecture.

Small, focused increments make it easier to test, review and debug.

## Handling Missing Requirements

- Never invent product behaviour. If a requirement is unclear or missing, document it in the **Open Questions** section of `progress-tracker.md`.
- Discuss and resolve ambiguities in the context files or feature specifications before proceeding with implementation.
- Update the feature specification or context file when the requirement is clarified.

## Protected Foundation Components

Do not edit or override third‑party components in `components/ui/*` or library internals. Compose new UI from these building blocks instead of modifying them. Only modify these components when a task specifically instructs you to do so.

## Keeping Docs in Sync

Whenever an implementation impacts the architecture, coding standards or UI guidelines, update the corresponding context file first. After completing a feature or sub‑feature:

1. Update `progress-tracker.md`:
   - Mark the feature or sub‑feature as completed.
   - Update the current phase and next steps.
   - Record any open questions that emerged during implementation.
2. Commit the changes and reference the feature name in the commit message.

## Before Moving to the Next Feature

Verify that:

- The implemented feature meets all acceptance criteria in its specification.
- Unit and integration tests pass.
- No invariants defined in `architecture-context.md` are violated.
- Documentation is updated.

Use this workflow to ensure consistent and maintainable development across the entire project.
