# OpenCode.md

## Build, Lint, and Test Commands
- **Build**: `npm run build` - Compiles the project for production.
- **Lint**: `npm run lint` - Checks code for style and potential errors.
- **Test**: `npm run test` - Runs the full test suite.
- **Single Test**: `npm run test -- <path/to/test/file>` - Runs a specific test file.

## Code Style Guidelines
- **Imports**: Group imports by type (standard, third-party, local) with a blank line between groups.
- **Formatting**: Use Prettier defaults with 2-space indentation for TypeScript and Svelte.
- **Types**: Explicitly type all variables and functions; avoid `any` unless necessary.
- **Naming Conventions**: Use camelCase for variables/functions, PascalCase for types/components.
- **Error Handling**: Use try-catch for async operations; log errors with context.
- **File Structure**: Follow existing structure (e.g., components in `src/components/`).
- **Comments**: Use JSDoc for functions; keep inline comments minimal and meaningful.
- **Framework**: Use Svelte for UI components, TypeScript for logic.

## Notes
- This file is for agentic coding agents to maintain consistency in the repository.
- Ensure all changes align with the existing architecture for Chrome extensions.