<!--
LLM Instructions for Creating ADR from This Template:

1. FILE CREATION:
   - Create new file at: `docs/architecture/decisions/{YYYY-MM-DD}-{slug}.md`
   - Format: YYYY-MM-DD = (date +%Y-%m-%d), slug = lowercase-hyphenated-title
   - Example: `docs/architecture/decisions/2024-03-15-database-selection.md`

2. TEMPLATE USAGE:
   - Copy entire template content EXCEPT this instruction block
   - Replace all placeholder values (e.g., {TITLE}, {STATUS}, etc.)
   - Ensure all sections are completed with relevant information

3. CONTENT GUIDELINES:
   - Title: Brief problem statement and solution (e.g., "Use PostgreSQL for Primary Database")
   - Status: Must be one of: Proposed, Accepted, Deprecated, Superseded
   - Context: Explain the background and problem requiring a decision
   - Decision: State the chosen solution clearly and concisely
   - Consequences: List both positive and negative impacts
   - Alternatives: Document other options that were considered
   - References: Use "@" prefix for internal repo links (e.g., @docs/readme.md)

4. LANGUAGE & FORMATTING:
   - Write ALL content in English (including placeholders)
   - Use "@" notation for referencing documents within this repository
   - Use standard URLs for external references
   - Maintain consistent markdown formatting

5. IMPORTANT:
   - Remove this entire instruction comment block from the new file
   - Use present tense for decisions ("We will use..." not "We used...")
   - Ensure all placeholder text is replaced with actual content
-->

---

title: {short title of solved problem and solution}
status: {Proposed | Accepted | Deprecated | Superseded}
updated: {YYYY-MM-DD}

---

## Context

{Explain the background and problem requiring a decision}

## Decision

{State the chosen solution clearly and concisely}

## Consequences

- List both positive and negative impacts

## Alternatives

- {Alternative proposal} - {Reasons for rejection}
  ...

## References

{List relevant documentation and resources}

Examples:

- Related RFC: @docs/architecture/decisions/{YYYY-MM-DD}-{slug}.md
- https://example.com/relevant-article (external reference)
