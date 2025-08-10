# Architecture Documentation

## Overview

This directory contains architectural decisions and technical research documentation for the project. We use two main document types to manage technical decisions:

- **RFC (Request for Comments)**: Technical research and evaluation documents
- **ADR (Architecture Decision Records)**: Final architecture decisions for the project

## Document Types

### RFC (Request for Comments)

**Purpose**: Comprehensive technical research and option evaluation

**Responsibilities**:

- Analyze multiple technology options with detailed comparisons
- Document general best practices and industry standards
- Clarify technical trade-offs and implications
- Provide implementation patterns and sample code
- Evaluate maintenance burden and community health
- Present unbiased technical analysis

**Output**: Decision-making materials for technical selection

**Location**: @/docs/architecture/rfc/

**Naming Convention**: `YYYY-MM-DD-{topic}.md`

### ADR (Architecture Decision Records)

**Purpose**: Document project-specific technical decisions

**Responsibilities**:

- Record the final decision based on RFC analysis and team review
- Explain selection rationale in project context
- Define implementation plan with phased approach
- Document project-specific constraints and requirements
- Specify success criteria and validation methods
- Include fallback strategies and risk mitigation

**Output**: Executable technical decisions and implementation guide

**Location**: @/docs/architecture/adr/

**Naming Convention**: `{number}-{decision-title}.md`

## Workflow

```mermaid
graph LR
    A[Technical Question] --> B[RFC Creation]
    B --> C[Research & Analysis]
    C --> D[Team Review]
    D --> E[ADR Creation]
    E --> F[Implementation]
    F --> G[Validation]
```

1. **RFC Phase**:
   - Research specialist agent creates comprehensive RFC
   - Evaluates all viable options
   - Provides neutral technical analysis

2. **Review Phase**:
   - Team reviews RFC content
   - Discusses project-specific factors
   - Makes informed decision

3. **ADR Phase**:
   - ADR agent creates decision record based on RFC
   - Incorporates project context from codebase analysis
   - Defines concrete implementation steps

4. **Implementation Phase**:
   - Follow ADR implementation guide
   - Validate against success criteria
   - Update documentation as needed

## Key Differences

| Aspect               | RFC                        | ADR                              |
| -------------------- | -------------------------- | -------------------------------- |
| **Scope**            | General technical analysis | Project-specific decision        |
| **Audience**         | Technical evaluators       | Implementation team              |
| **Content**          | Multiple options           | Single decision                  |
| **Context**          | Industry best practices    | Project constraints              |
| **Lifecycle**        | Research document          | Living decision record           |
| **Update Frequency** | Rarely updated             | Updated with significant changes |

## Templates

- @docs/architecture/\_templates/adr.md
- @docs/architecture/\_templates/rfc.md

## Best Practices

### For RFCs:

- Remain objective and unbiased
- Include quantitative metrics where possible
- Document all viable alternatives
- Provide clear evaluation criteria
- Include performance benchmarks

### For ADRs:

- Reference the originating RFC
- Be explicit about the decision
- Document the "why" not just the "what"
- Include migration strategies
- Define clear success metrics

## Tools and Automation

### Library Evaluation Tools

- `npm view [package]`: Package metadata and statistics
- GitHub API: Repository health metrics
- MCP Servers: Automated documentation retrieval
- Context7: Up-to-date library documentation
- DeepWiki: Repository structure analysis

### Project Analysis Tools

- Serena MCP: Codebase pattern detection
- Git history: Past decision analysis
- Dependency analysis: Current technology stack

## Maintenance

- RFCs are kept for historical reference
- ADRs are updated when decisions change
- Both document types are version controlled
- Major changes require new ADR with supersedes notation
