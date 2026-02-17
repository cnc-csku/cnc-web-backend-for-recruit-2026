
## Brief overview
These guidelines define the workflow for maintaining project documentation in the memory-bank and ensuring context awareness before starting any development task.

## Before starting any task
- [ ] Read all files in the memory-bank directory to understand the current project state
- [ ] Pay special attention to: architecture.md, data-models.md, api-endpoints.md, and any relevant feature documentation
- [ ] Understand the existing code patterns by reviewing similar features in src/features/
- [ ] Check existing audit logging patterns to maintain consistency

## When creating new features or logic
- [ ] Update memory-bank documentation to reflect new functionality
- [ ] Add new API endpoints to api-endpoints.md with request/response schemas
- [ ] Update data-models.md if new collections or fields are introduced
- [ ] Update architecture.md if the system architecture changes
- [ ] Add new audit actions to audit-logging-system.md if applicable
- [ ] Update interview-process.md if interview workflow is affected
- [ ] Update development-guide.md with any new development patterns

## Documentation standards
- Keep documentation in sync with code changes
- Use existing memory-bank files as reference templates
- Maintain consistent formatting and style with existing documentation
- Include code examples where applicable
