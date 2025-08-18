<!--
Prompt to trigger the action:
TBD

LLM Instructions for Creating Decision Document from This Template:

1. FILE CREATION
   - Create new file at: `docs/architecture/decisions/{YYYY-MM-DD}-{slug}.md`
   - Format: YYYY-MM-DD = (date +%Y-%m-%d), slug = lowercase-hyphenated-title
   - Example: `docs/architecture/decisions/2024-03-15-database-selection.md`
   - Record template version: Use `git log -1 --format=%H docs/architecture/_templates/decision.md` to get last commit hash of this template
   - Fill in `template_version` field with commit hash or tag version

2. TEMPLATE USAGE
   - Copy entire template content EXCEPT this instruction block
   - Replace all placeholder values marked with {braces}
   - Complete all sections with decision rationale and impact analysis
   - Remove any unused optional sections

3. DECISION DOCUMENTATION REQUIREMENTS
   - Title: Brief problem statement and solution (e.g., "Use PostgreSQL for Primary Database")
   - Status: Must be one of: Proposed, Accepted, Deprecated, Superseded
   - Template Version: Git commit hash or tag from template repository
   - Template Source: Path to source template file
   - Context: Explain the background and problem requiring a decision (reference research doc)
   - Decision: State the chosen solution with clear rationale for why it was selected
   - Consequences: List both positive and negative impacts (include mitigations for negatives)
   - Alternatives: Document other options with specific rejection reasons
   - Technologies: Explicitly list what to use and what to avoid
   - References: Must link to related research document

4. CONTENT GUIDELINES
   Required Elements:
   - Title: Clear statement of decision (problem + solution)
   - Status: Proposed | Accepted | Deprecated | Superseded
   - Template Version: Git commit hash or tag
   - Template Source: Path to source template file
   - Context with research reference
   - Explicit decision statement
   - Rationale with trade-off analysis
   - Implementation guidelines

   Writing Style:
   - Language: English only
   - Tense: Present for decisions ("We will use...")
   - References: @ for internal, URLs for external
   - Code: Proper syntax highlighting
   - Libraries: Always in backticks
   - Lists: Prefer bullets over tables

   Diagram Guidelines:
    - Include mermaid diagrams where helpful
    - For sequenceDiagram: Use "Note" syntax to add explanatory context (e.g., Note over, Note right of)
    - For sequenceDiagram: Use "box" syntax to group related components logically
    - Make diagrams self-explanatory with descriptive labels and notes

5. QUALITY CHECKLIST
   Before submitting:
   □ Research document properly referenced with @ link
   □ Decision stated with rationale explaining why chosen over alternatives
   □ Rationale includes trade-off analysis
   □ All alternatives explicitly rejected with reasons
   □ Implementation guidelines complete
   □ Technologies to use/avoid clearly listed
   □ Research document updated with link to this decision (add "**Related Decision**: @docs/architecture/decisions/{YYYY-MM-DD}-{slug}.md" (this file) to research doc)
-->

---

title: {short title of solved problem and solution}
status: {Proposed | Accepted | Deprecated | Superseded}
updated: {YYYY-MM-DD}
template_version: {commit hash}
template_source: docs/architecture/\_templates/decision.md

---

## Context

{Explain the background and problem requiring a decision}

## Decision

**We will use {chosen solution}**

### Rationale

{Explain why this option was chosen over alternatives, including:}

- How it aligns with project goals and constraints
- Which trade-offs were deemed acceptable
- Key factors that influenced the decision

## Consequences

### Positive

- {Benefit 1}
- ...

### Negative

- {Drawback 1 - and how we'll mitigate it}
- ...

## Alternatives Considered

### {Alternative N}

**Rejected because**: {Specific reason for rejection}

{Repeat for each alternative Considered...}

## Implementation Guidelines

### Technologies to Use

**IMPORTANT: These are the ONLY technologies that should be used for this implementation**

- **`{library-name}`**: {version} - {purpose}
  - Installation: `pnpm add {package-name}`
  - Configuration: {any special setup}
    ...

### Technologies NOT to Use

**CRITICAL: Do NOT use these technologies under any circumstances**

- **{Rejected library}**: {Reason it should not be used}
- **{Similar library}**: Use {approved library} instead

## References

### Primary Sources

- **Research Document**: @docs/architecture/researches/{YYYY-MM-DD}-{topic}.md
- **Related Decision**: {Link to any related decision documents if applicable}

### Update History

- {YYYY-MM-DD}: Initial decision documented
- {YYYY-MM-DD}: {Any updates or amendments}
